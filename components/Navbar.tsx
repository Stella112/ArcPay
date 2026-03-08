'use client';

import { ConnectKitButton } from 'connectkit';

export function Navbar() {
    return (
        <nav className="navbar">
            <a className="nav-logo" href="/">
                <div className="nav-logo-icon">⚡</div>
                <span className="nav-logo-text">Arc Payout Hub</span>
                <span className="nav-badge">Testnet</span>
            </a>

            <ConnectKitButton />
        </nav>
    );
}
