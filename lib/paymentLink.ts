export type PaymentLinkPayload = {
    recipient: string;
    amount: string;
    memo?: string;
    chainId: number;
    createdAt?: string;
};

function toBase64Url(base64: string) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(base64url: string) {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
        base64 += '='.repeat(4 - padding);
    }
    return base64;
}

function encodeBase64Url(input: string) {
    if (typeof window === 'undefined') {
        return Buffer.from(input, 'utf-8').toString('base64url');
    }
    const bytes = new TextEncoder().encode(input);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return toBase64Url(btoa(binary));
}

function decodeBase64Url(encoded: string) {
    const base64 = fromBase64Url(encoded);
    if (typeof window === 'undefined') {
        return Buffer.from(base64, 'base64').toString('utf-8');
    }
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

export function encodePaymentLink(payload: PaymentLinkPayload) {
    return encodeBase64Url(JSON.stringify(payload));
}

export function decodePaymentLink(encoded: string): PaymentLinkPayload | null {
    try {
        const raw = decodeBase64Url(encoded);
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed as PaymentLinkPayload;
    } catch {
        return null;
    }
}
