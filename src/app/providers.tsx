"use client";

import { FC } from "react";
import {
  AllDefaultWallets,
  defineStashedWallet,
  WalletProvider,
} from "@suiet/wallet-kit";

import { SessionProvider } from "next-auth/react";
/**
 * Custom provider component for integrating with third-party providers.
 * https://nextjs.org/docs/getting-started/react-essentials#rendering-third-party-context-providers-in-server-components
 * @param props
 * @constructor
 */
const SuiWalletProvider: FC<any> = ({ children }) => {
  return (
    <WalletProvider
      defaultWallets={[
        ...AllDefaultWallets,
        defineStashedWallet({
          appName: "Suiet Kit Playground",
        }),
      ]}
    >
      <SessionProvider>{children}</SessionProvider>
    </WalletProvider>
  );
};

export default SuiWalletProvider;
