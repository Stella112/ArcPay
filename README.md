# Arc Payout UI 🌌

A premium Web3 dashboard built for executing batch transactions on the Arc Testnet. Designed with a high-end, dark-mode glassmorphism aesthetic, this application allows users to seamlessly connect their wallets and distribute native USDC to multiple addresses in a single transaction.

## 🚀 Features

* **Sleek Interface:** Custom dark-mode glassmorphism UI with neon emerald and blue accents.
* **Wallet Integration:** Seamless wallet connections using Wagmi v2, Viem, and the ConnectKit modal.
* **Batch Processing:** Drop in a `.csv` file or paste raw text (`address, amount`) to instantly parse and validate recipients.
* **Smart Contract Execution:** Interacts directly with a custom `batchTransfer` smart contract to handle 18-decimal native USDC gas calculations.

## 🛠 Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Web3 Libraries:** Wagmi v2, Viem, ConnectKit, TanStack React Query
* **Styling:** Vanilla CSS (CSS Variables, Keyframe Animations, Backdrop Filters)

## 🔗 Network & Contract Details

* **Network:** Arc Testnet
* **Chain ID:** `5042002`
* **RPC URL:** `https://rpc.testnet.arc.network`
* **Contract Address:** `0x670927A1AB320108d719eE7a3C8F6def396Db87a`

## 💻 Local Development

To run this project locally, ensure you have Node.js installed, then follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Stella112/arc-payout-ui.git](https://github.com/Stella112/arc-payout-ui.git)
   npm install
   npm run dev
