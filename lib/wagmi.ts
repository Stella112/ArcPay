import { http, createConfig } from 'wagmi';
import { defineChain, createPublicClient, fallback } from 'viem';
import { mainnet } from 'viem/chains';

export const arcTestnet = defineChain({
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 18,
    },
    rpcUrls: {
        default: { http: ['https://rpc.testnet.arc.network'] },
    },
    testnet: true,
});

export const wagmiConfig = createConfig({
    chains: [arcTestnet, mainnet],
    transports: {
        [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
        [mainnet.id]: fallback([
            http('https://cloudflare-eth.com'),
            http('https://eth.llamarpc.com'),
            http()
        ]),
    },
    ssr: true,
});

// A standalone Viem public client specifically used to resolve Mainnet ENS domains (.eth)
export const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: fallback([
        http('https://cloudflare-eth.com'),
        http('https://eth.llamarpc.com'),
        http()
    ]),
});
