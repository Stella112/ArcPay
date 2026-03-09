'use client';

import { useState, useMemo, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, isAddress } from 'viem';
import { PAYOUT_ABI, PAYOUT_CONTRACT_ADDRESS } from '@/lib/contract';
import { arcTestnet } from '@/lib/wagmi';
import { AIChat } from './AIChat';

interface ParsedRow {
    address: string;
    amount: string;
    amountWei: bigint;
    valid: boolean;
    error?: string;
}

function parseCSV(raw: string): { rows: ParsedRow[]; parseError: string | null } {
    const lines = raw.trim().split('\n').filter((l) => l.trim());
    if (lines.length === 0) return { rows: [], parseError: null };

    const rows: ParsedRow[] = lines.map((line, idx) => {
        const parts = line.split(',');
        if (parts.length < 2) {
            return { address: line.trim(), amount: '', amountWei: 0n, valid: false, error: `Line ${idx + 1}: missing amount` };
        }
        const address = parts[0].trim();
        const amountStr = parts.slice(1).join(',').trim();

        if (!isAddress(address)) {
            return { address, amount: amountStr, amountWei: 0n, valid: false, error: `Line ${idx + 1}: invalid address` };
        }
        const parsedFloat = parseFloat(amountStr);
        if (isNaN(parsedFloat) || parsedFloat <= 0) {
            return { address, amount: amountStr, amountWei: 0n, valid: false, error: `Line ${idx + 1}: invalid amount "${amountStr}"` };
        }
        try {
            const amountWei = parseEther(parsedFloat.toString());
            return { address, amount: amountStr, amountWei, valid: true };
        } catch {
            return { address, amount: amountStr, amountWei: 0n, valid: false, error: `Line ${idx + 1}: amount parse failed` };
        }
    });

    const firstError = rows.find((r) => !r.valid)?.error ?? null;
    return { rows, parseError: firstError };
}

function truncateAddress(addr: string) {
    return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export function PayoutCard() {
    const [csvText, setCsvText] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isConnected } = useAccount();

    const { rows, parseError } = useMemo(() => parseCSV(csvText), [csvText]);
    const validRows = rows.filter((r) => r.valid);
    const totalWei = validRows.reduce((acc, r) => acc + r.amountWei, 0n);
    const totalDisplay = validRows.reduce((acc, r) => acc + parseFloat(r.amount), 0);

    const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const canExecute = isConnected && validRows.length > 0 && !parseError && !isPending && !isConfirming;

    function handleExecute() {
        if (!canExecute) return;
        reset();
        writeContract({
            address: PAYOUT_CONTRACT_ADDRESS,
            abi: PAYOUT_ABI,
            functionName: 'batchTransfer',
            args: [
                validRows.map((r) => r.address as `0x${string}`),
                validRows.map((r) => r.amountWei),
            ],
            value: totalWei,
            chainId: arcTestnet.id,
        });
    }

    function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                setCsvText(text);
                reset(); // Clear any previous errors/status
            }
        };
        reader.readAsText(file);

        // Reset the input value so the same file can be uploaded again if needed
        event.target.value = '';
    }

    const statusType = isSuccess ? 'success' : writeError ? 'error' : (isPending || isConfirming) ? 'pending' : null;

    return (
        <div className="glass-card-elevated payout-card fade-in-up">
            {/* Header */}
            <div className="card-header">
                <h1 className="card-title">Batch Payout</h1>
                <p className="card-subtitle">
                    Paste a CSV list of recipient addresses and USDC amounts.<br />
                    Each line: <code style={{ color: 'var(--neon-emerald)', fontSize: '0.8rem' }}>0xAddress, amount</code>
                </p>
            </div>

            {/* Textarea */}
            <div className="field-label">
                <span>Recipients</span>
                <div className="field-label-actions">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button
                        className="btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        📄 Import CSV File
                    </button>
                    {validRows.length > 0 && (
                        <span className="field-label-count">{validRows.length} address{validRows.length !== 1 ? 'es' : ''} parsed</span>
                    )}
                </div>
            </div>
            <textarea
                id="csv-input"
                className="csv-textarea"
                value={csvText}
                onChange={(e) => { setCsvText(e.target.value); reset(); }}
                placeholder={`0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b, 50.5\n0xDeAdBeEf1234567890abcdef1234567890AbCdEf, 12.0\n0xFe3d4a5B6c7D8e9F0a1B2c3D4e5F6a7B8c9D0e1F, 100.25`}
                spellCheck={false}
            />

            {parseError && <div className="parse-error">⚠ {parseError} — fix before executing.</div>}

            {/* Preview Table */}
            {validRows.length > 0 && (
                <div className="preview-table-wrap" style={{ marginTop: '14px' }}>
                    <table className="preview-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Address</th>
                                <th style={{ textAlign: 'right' }}>Amount (USDC)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {validRows.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ color: 'var(--text-dim)', width: '32px' }}>{i + 1}</td>
                                    <td className="td-address">{truncateAddress(row.address)}</td>
                                    <td className="td-amount">{parseFloat(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Total */}
            {validRows.length > 0 && (
                <div className="total-row">
                    <span className="total-label">Total Value (msg.value)</span>
                    <span className="total-value">{totalDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC</span>
                </div>
            )}

            {validRows.length === 0 && <div style={{ height: '24px' }} />}

            {/* Execute Button & AI Button */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    id="execute-payout-btn"
                    className={`btn-primary${isPending || isConfirming ? ' loading' : ''}`}
                    onClick={handleExecute}
                    disabled={!canExecute}
                >
                    {isPending ? (
                        <>
                            <span className="spinner" />
                            Awaiting Wallet…
                        </>
                    ) : isConfirming ? (
                        <>
                            <span className="spinner" />
                            Confirming on Chain…
                        </>
                    ) : !isConnected ? (
                        '🔗 Connect Wallet to Continue'
                    ) : (
                        <>
                            ⚡ Execute Batch Payout
                            {validRows.length > 0 && ` (${validRows.length})`}
                        </>
                    )}
                </button>

                <button
                    className="btn-secondary"
                    style={{ whiteSpace: 'nowrap', border: '1px solid rgba(0, 255, 163, 0.3)', color: 'var(--neon-emerald)', animation: 'pulse-glow 3s infinite', padding: '14px 24px' }}
                    onClick={() => setIsChatOpen(true)}
                >
                    ✨ Ask AI Co-Pilot
                </button>
            </div>

            {/* Transaction Status */}
            {statusType && (
                <div className={`tx-status ${statusType}`}>
                    <span className="tx-status-icon">
                        {statusType === 'success' ? '✅' : statusType === 'error' ? '❌' : '🔄'}
                    </span>
                    <div className="tx-status-content">
                        <div className="tx-status-title">
                            {statusType === 'success' && 'Transaction Confirmed!'}
                            {statusType === 'error' && 'Transaction Failed'}
                            {statusType === 'pending' && (isPending ? 'Waiting for wallet signature…' : 'Waiting for confirmation…')}
                        </div>
                        {txHash && (
                            <a
                                className="tx-hash-link"
                                href={`https://explorer.testnet.arc.network/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {txHash}
                            </a>
                        )}
                        {writeError && (
                            <div className="tx-status-detail">
                                {writeError.message.slice(0, 200)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AIChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                csvContext={csvText}
            />
        </div>
    );
}
