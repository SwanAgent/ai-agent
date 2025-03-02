"use client";

import { FC } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NearWalletProvider } from "@/contexts/near-wallet";
import "@near-wallet-selector/modal-ui/styles.css";

const queryClient = new QueryClient();

const NearWalletProviderWrapper: FC<any> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NearWalletProvider>
        <SessionProvider>{children}</SessionProvider>
      </NearWalletProvider>
    </QueryClientProvider>
  );
};

export { NearWalletProviderWrapper as NearWalletProvider };