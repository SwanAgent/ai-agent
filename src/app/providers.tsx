"use client";

import { FC } from "react";
import { SessionProvider } from "next-auth/react";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const queryClient = new QueryClient();

const SuiWalletProvider: FC<any> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider>
          <SessionProvider>{children}</SessionProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export default SuiWalletProvider;