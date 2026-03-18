'use client';

import { ConnectKitButton } from 'connectkit';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div style={{ width: 38, height: 38 }} />;

    return (
        <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="theme-toggle fade-in"
            aria-label="Toggle theme"
        >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}

export function Navbar() {
    return (
        <nav className="navbar">
            <a className="nav-logo" href="/">
                <div className="nav-logo-icon">⚡</div>
                <span className="nav-logo-text">Arc Payout Hub</span>
                <span className="nav-badge">Testnet</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ThemeToggle />
                <ConnectKitButton />
            </div>
        </nav>
    );
}
