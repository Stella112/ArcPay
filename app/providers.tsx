'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { ThemeProvider, useTheme } from 'next-themes';
import { wagmiConfig } from '@/lib/wagmi';
import { useState, useEffect } from 'react';

function ClientApp({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Default to dark mode before hydration to prevent structural flashes or mismatches
    const mode = mounted && resolvedTheme === 'light' ? 'light' : 'dark';

    return (
        <ConnectKitProvider
            mode={mode}
            theme="midnight"
            customTheme={{
                '--ck-font-family': '"Inter", sans-serif',
                '--ck-border-radius': '16px',
                '--ck-overlay-background': 'rgba(0, 0, 0, 0.75)',
                '--ck-body-background': mode === 'light' ? '#f5f7f9' : '#060d15',
                '--ck-body-background-secondary': mode === 'light' ? '#ffffff' : '#0d1c2b',
                '--ck-body-color': mode === 'light' ? '#111827' : '#e2f0ff',
                '--ck-body-color-muted': mode === 'light' ? '#6b7280' : '#7aa0c4',
                '--ck-primary-button-background': 'linear-gradient(135deg, #00ffa3 0%, #00b4ff 100%)',
                '--ck-primary-button-color': '#050a0f',
                '--ck-primary-button-border-radius': '12px',
                '--ck-connectbutton-background': mode === 'light' ? 'rgba(0, 255, 163, 0.15)' : 'rgba(0, 255, 163, 0.08)',
                '--ck-connectbutton-color': mode === 'light' ? '#047857' : '#00ffa3',
                '--ck-connectbutton-border-radius': '12px',
            }}
        >
            {children}
        </ConnectKitProvider>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="data-theme" defaultTheme="dark">
                    <ClientApp>{children}</ClientApp>
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
