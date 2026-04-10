'use client';

import { useMemo } from 'react';
import { decodePaymentLink } from '@/lib/paymentLink';
import { arcTestnet } from '@/lib/wagmi';
import { isAddress, parseUnits } from 'viem';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

type PayPageProps = {
    params: {
        id: string;
    };
};

export default function PayPage({ params }: PayPageProps) {
    const { isConnected } = useAccount();
    const decoded = useMemo(() => decodePaymentLink(params.id), [params.id]);

    const paymentDetails = useMemo(() => {
        if (!decoded) return { error: 'Invalid or malformed payment link.' };
        if (!isAddress(decoded.recipient)) return { error: 'Recipient address is invalid.' };
        const numeric = Number(decoded.amount);
        if (!Number.isFinite(numeric) || numeric <= 0) return { error: 'Amount is invalid.' };
        try {
            const amountWei = parseUnits(numeric.toString(), arcTestnet.nativeCurrency.decimals);
            return {
                recipient: decoded.recipient,
                amount: numeric,
                amountWei,
                memo: decoded.memo,
                createdAt: decoded.createdAt,
                chainId: decoded.chainId,
            };
        } catch {
            return { error: 'Amount could not be parsed.' };
        }
    }, [decoded]);

    const chainMismatch = !!decoded?.chainId && decoded.chainId !== arcTestnet.id;

    const {
        data: txHash,
        sendTransaction,
        isPending,
        error: sendError,
        reset,
    } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const canPay = isConnected && !chainMismatch && !isPending && !isConfirming && !('error' in paymentDetails);

    const handlePay = () => {
        if (!canPay || 'error' in paymentDetails) return;
        reset();
        sendTransaction({
            to: paymentDetails.recipient as `0x${string}`,
            value: paymentDetails.amountWei,
            chainId: arcTestnet.id,
        });
    };

    const statusType = isSuccess ? 'success' : sendError ? 'error' : (isPending || isConfirming) ? 'pending' : null;

    return (
        <div className="glass-card-elevated payout-card pay-card fade-in-up">
            <div className="card-header">
                <h1 className="card-title">Complete Payment</h1>
                <p className="card-subtitle">
                    Review the details below and send a single USDC payment on Arc Testnet.
                </p>
            </div>

            {'error' in paymentDetails ? (
                <div className="parse-error">⚠ {paymentDetails.error}</div>
            ) : (
                <>
                    <div className="pay-details">
                        <div className="pay-row">
                            <span>Recipient</span>
                            <span className="pay-value">{paymentDetails.recipient}</span>
                        </div>
                        <div className="pay-row">
                            <span>Amount</span>
                            <span className="pay-value">{paymentDetails.amount.toLocaleString()} USDC</span>
                        </div>
                        {paymentDetails.memo && (
                            <div className="pay-row">
                                <span>Memo</span>
                                <span className="pay-value">{paymentDetails.memo}</span>
                            </div>
                        )}
                        {paymentDetails.createdAt && (
                            <div className="pay-row">
                                <span>Created</span>
                                <span className="pay-value">{new Date(paymentDetails.createdAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {chainMismatch && (
                        <div className="parse-error">⚠ Switch to Arc Testnet (chain {arcTestnet.id}) to continue.</div>
                    )}

                    {!isConnected && (
                        <div className="form-helper">Connect your wallet from the top-right to continue.</div>
                    )}

                    <button
                        className={`btn-primary${isPending || isConfirming ? ' loading' : ''}`}
                        onClick={handlePay}
                        disabled={!canPay}
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
                        ) : (
                            'Send Payment'
                        )}
                    </button>
                </>
            )}

            {statusType && (
                <div className={`tx-status ${statusType}`}>
                    <span className="tx-status-icon">
                        {statusType === 'success' ? '✅' : statusType === 'error' ? '❌' : '🔄'}
                    </span>
                    <div className="tx-status-content">
                        <div className="tx-status-title">
                            {statusType === 'success' && 'Payment Confirmed!'}
                            {statusType === 'error' && 'Payment Failed'}
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
                        {sendError && (
                            <div className="tx-status-detail">
                                {sendError.message.slice(0, 200)}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
