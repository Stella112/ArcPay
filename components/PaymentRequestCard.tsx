'use client';

import { useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';
import QRCode from 'qrcode';
import { arcTestnet } from '@/lib/wagmi';
import { encodePaymentLink } from '@/lib/paymentLink';
import Image from 'next/image';

export function PaymentRequestCard() {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const parsedAmount = useMemo(() => {
        const numeric = Number(amount);
        if (!Number.isFinite(numeric) || numeric <= 0) return null;
        return numeric;
    }, [amount]);

    const recipientError = recipient && !isAddress(recipient) ? 'Enter a valid 0x address.' : '';
    const amountError = amount && !parsedAmount ? 'Enter a positive amount.' : '';

    const payload = useMemo(() => {
        if (!isAddress(recipient) || !parsedAmount) return null;
        return {
            recipient,
            amount: parsedAmount.toString(),
            memo: memo.trim() || undefined,
            chainId: arcTestnet.id,
            createdAt: new Date().toISOString(),
        };
    }, [recipient, parsedAmount, memo]);

    const encoded = useMemo(() => (payload ? encodePaymentLink(payload) : ''), [payload]);

    const baseUrl = mounted
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL ?? '';

    const link = encoded && baseUrl ? `${baseUrl}/pay/${encoded}` : '';
    const baseUrlMissing = encoded && !baseUrl;

    useEffect(() => {
        let active = true;
        if (!link) {
            setQrDataUrl(null);
            return () => {
                active = false;
            };
        }

        QRCode.toDataURL(link, {
            width: 220,
            margin: 2,
            color: {
                dark: '#00ffa3',
                light: '#060d15',
            },
        })
            .then((dataUrl) => {
                if (active) setQrDataUrl(dataUrl);
            })
            .catch(() => {
                if (active) setQrDataUrl(null);
            });

        return () => {
            active = false;
        };
    }, [link]);

    const handleCopy = async () => {
        if (!link) return;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="glass-card-elevated payout-card request-card fade-in-up">
            <div className="card-header">
                <h1 className="card-title">Payment Request</h1>
                <p className="card-subtitle">
                    Generate a Qevor payment link and QR code for a single USDC transfer on Arc Testnet.
                </p>
            </div>

            <div className="form-grid">
                <div className="form-field">
                    <label className="form-label" htmlFor="recipient">Recipient Address</label>
                    <input
                        id="recipient"
                        className="text-input"
                        placeholder="0xabc...123"
                        value={recipient}
                        onChange={(event) => setRecipient(event.target.value.trim())}
                    />
                    {recipientError && <div className="form-error">{recipientError}</div>}
                </div>

                <div className="form-field">
                    <label className="form-label" htmlFor="amount">Amount (USDC)</label>
                    <input
                        id="amount"
                        className="text-input"
                        placeholder="10.5"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                    />
                    {amountError && <div className="form-error">{amountError}</div>}
                </div>
            </div>

            <div className="form-field">
                <label className="form-label" htmlFor="memo">Memo (optional)</label>
                <input
                    id="memo"
                    className="text-input"
                    placeholder="Invoice #204"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                />
                <div className="form-helper">This memo is embedded in the link for the payer to see.</div>
            </div>

            <div className="divider" />

            <div className="link-row">
                <div className="link-column">
                    <label className="form-label">Shareable Link</label>
                    <div className="link-input">
                        <input className="text-input" value={link || 'Enter recipient + amount to generate'} readOnly />
                        <button className="btn-secondary" onClick={handleCopy} disabled={!link}>
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <div className="form-helper">Links are encoded locally — no server storage required.</div>
                    {baseUrlMissing && (
                        <div className="form-error">
                            Set NEXT_PUBLIC_BASE_URL to generate absolute links during server rendering.
                        </div>
                    )}
                </div>

                <div className="qr-panel">
                    {qrDataUrl ? (
                        <Image
                            className="qr-image"
                            src={qrDataUrl}
                            alt="Payment request QR code"
                            width={220}
                            height={220}
                            unoptimized
                        />
                    ) : (
                        <div className="qr-placeholder">QR preview</div>
                    )}
                </div>
            </div>
        </div>
    );
}
