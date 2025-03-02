# NEAR Agent

A DeFAI (Decentralized Finance AI) application built on the NEAR Protocol.

## Features

- NEAR Wallet integration using Wallet Selector
- Authentication with NEAR accounts
- Portfolio management
- AI-powered financial insights

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/near-agent.git
cd near-agent
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
# NEAR Configuration
NEXT_PUBLIC_NEAR_NETWORK=testnet
NEXT_PUBLIC_NEAR_CONTRACT_ID=guest-book.testnet
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id

# Next Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Other Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> Note: We're using `guest-book.testnet` as the default contract ID since it's a well-known example contract on the NEAR testnet. You can replace it with your own contract ID if needed.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## NEAR Wallet Selector Integration

This project uses the NEAR Wallet Selector to provide a seamless wallet connection experience. The Wallet Selector is a library that allows users to connect to your application using their preferred NEAR wallet.

### Supported Wallets

- NEAR Wallet
- MyNEAR Wallet
- Sender Wallet
- Here Wallet
- Math Wallet
- Nightly
- Meteor Wallet
- Ledger
- Nightly Connect
- Coin98 Wallet
- WalletConnect

### Usage

The wallet integration is handled through the `NearWalletProvider` context. To use it in your components:

```tsx
import { useNearWallet } from "@/contexts/near-wallet";

function MyComponent() {
  const { accountId, signIn, signOut, signMessage } = useNearWallet();
  
  // Check if user is signed in
  if (accountId) {
    return <div>Connected as: {accountId}</div>;
  }
  
  return <button onClick={signIn}>Connect Wallet</button>;
}
```

### Authentication Flow

1. User clicks "Login with NEAR"
2. Wallet Selector modal appears, allowing the user to choose their preferred wallet
3. User approves the connection in their wallet
4. The application signs a message with the user's account to verify ownership
5. User is authenticated and can access the application features

## License

This project is licensed under the MIT License - see the LICENSE file for details.