'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { wagmiConfig } from '@/lib/wagmi';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider
                    theme="midnight"
                    customTheme={{
                        '--ck-font-family': '"Inter", sans-serif',
                        '--ck-border-radius': '16px',
                        '--ck-overlay-background': 'rgba(0, 0, 0, 0.75)',
                        '--ck-body-background': '#060d15',
                        '--ck-body-background-secondary': '#0d1c2b',
                        '--ck-body-color': '#e2f0ff',
                        '--ck-body-color-muted': '#7aa0c4',
                        '--ck-primary-button-background': 'linear-gradient(135deg, #00ffa3 0%, #00b4ff 100%)',
                        '--ck-primary-button-color': '#050a0f',
                        '--ck-primary-button-border-radius': '12px',
                        '--ck-connectbutton-background': 'rgba(0, 255, 163, 0.08)',
                        '--ck-connectbutton-color': '#00ffa3',
                        '--ck-connectbutton-border-radius': '12px',
                    }}
                >
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
