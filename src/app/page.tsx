"use client";

import { ConnectButton, useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginButton() {
  const account = useCurrentAccount();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  const router = useRouter();
  const { data: session } = useSession();

  const handleLogin = async () => {
    try {
      const msg = "Welcome to FOAM DeFAI Agent";
      const nonce = await getCsrfToken();
      const msgBytes = new TextEncoder().encode(
        JSON.stringify({ message: msg, nonce: nonce })
      );
      
      signPersonalMessage(
        {
          message: msgBytes,
        },
        {
          onSuccess: async (result) => {
            const response = await signIn("credentials", {
              signature: result.signature,
              message: msg,
              redirect: false,
              address: account?.address,
            });

            if (response?.ok) {
              router.push("/home");
            }
          },
        }
      );
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    if (account && !session) {
      handleLogin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, session]);

  return (
    <div className="flex flex-col items-center w-full justify-center h-screen">
      <h1 className="text-9xl font-bold p-10">Home Page</h1>
      <ConnectButton />
    </div>
  );
}