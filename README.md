# Qevor 🌌

A premium Web3 dashboard built for executing batch payouts and shareable payment requests on the Arc Testnet. Designed with a high-end, dark-mode glassmorphism aesthetic, Qevor lets users connect their wallets, distribute native USDC to multiple addresses, and generate single-payment links with QR codes.

## 🚀 Features

* **Sleek Interface:** Custom dark-mode glassmorphism UI with neon emerald and blue accents.
* **Wallet Integration:** Seamless wallet connections using Wagmi v2, Viem, and the ConnectKit modal.
* **Batch Processing:** Drop in a `.csv` file or paste raw text (`address, amount`) to instantly parse and validate recipients.
* **Payment Requests:** Create shareable `/pay/[id]` links and QR codes for single USDC transfers.
* **AI Co-Pilot:** Ask the embedded assistant to validate and summarize batch payout data.
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
   git clone https://github.com/Stella112/ArcPay.git
   npm install --legacy-peer-deps
   npm run dev
   ```

## 🔗 Payment Links

* `/request` generates a link and QR code for a single payment.
* `/pay/[id]` decodes the link payload client-side and sends a USDC transfer on Arc Testnet.
* Links are encoded locally and do not require server storage.

## 🔐 Environment Variables

Create a `.env.local` file (see `.env.example`):

* `GEMINI_API_KEY` — required for the AI co-pilot.
* `NEXT_PUBLIC_BASE_URL` — optional, used when generating payment links outside the browser context.
