"use client";

import { FC } from "react";
import { SessionProvider } from "next-auth/react";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpringSuiContextProvider } from "@/contexts/spring-sui";

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const queryClient = new QueryClient();

const SuiWalletProvider: FC<any> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect={true}>
          <SessionProvider>{children}</SessionProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

const SpringSuiProvider: FC<any> = ({ children }) => {
  return (
    <SpringSuiContextProvider>
      {children}
    </SpringSuiContextProvider>
  );
};

export { SuiWalletProvider, SpringSuiProvider };