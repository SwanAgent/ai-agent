"use client";

import { ErrorCode, useWallet } from "@suiet/wallet-kit";
import { ConnectButton } from "@suiet/wallet-kit";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginButton() {
  const wallet = useWallet();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogin = async () => {
    try {
      const msg = "Welcome to SISI AI Agent";
      const nonce = await getCsrfToken();
      const msgBytes = new TextEncoder().encode(
        JSON.stringify({ message: msg, nonce: nonce })
      );
      
      const result = await wallet.signPersonalMessage({
        message: msgBytes,
      });

      const response = await signIn("credentials", {
        signature: result.signature,
        message: msg,
        redirect: false,
        address: wallet.account?.address,
      });

      if (response?.ok) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    if (wallet.connected && !session) {
      handleLogin();
    }
  }, [wallet.connected, session]);

  return (
    <div className="flex flex-col items-center w-full justify-center h-screen">
      <h1 className="text-9xl font-bold p-10">Home Page</h1>
      <ConnectButton
        onConnectError={(error) => {
          if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
            console.warn(
              "User rejected the connection to " + error.details?.wallet
            );
          } else {
            console.warn("Unknown connect error:", error);
          }
        }}
      />
    </div>
  );
}