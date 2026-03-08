export const PAYOUT_CONTRACT_ADDRESS = '0x670927A1AB320108d719eE7a3C8F6def396Db87a' as const;

export const PAYOUT_ABI = [
    {
        inputs: [
            { internalType: 'address[]', name: 'recipients', type: 'address[]' },
            { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
        ],
        name: 'batchTransfer',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
] as const;
