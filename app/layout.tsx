import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Qevor',
  description: 'Unified batch payouts and payment requests on the Arc Testnet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <div className="bg-mesh" aria-hidden="true">
            <div className="bg-blob-mid" />
          </div>
          <div className="bg-noise" aria-hidden="true" />
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
