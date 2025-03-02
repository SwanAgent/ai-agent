import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import type { AccountState, WalletSelector, Wallet, NetworkId, SignMessageParams } from "@near-wallet-selector/core";
import { providers } from "near-api-js";
import { NEAR_NETWORK, CONTRACT_ID } from "@/constant";

// Define the context interface
interface NearWalletContext {
  selector: WalletSelector | null;
  modal: ReturnType<typeof setupModal> | null;
  accounts: Array<AccountState>;
  accountId: string | null;
  wallet: Wallet | null;
  isSignedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signMessage: (message: string) => Promise<{ signature: string }>;
  getProvider: () => providers.Provider | null;
}

// Create the context with default values
const NearWalletContext = createContext<NearWalletContext>({
  selector: null,
  modal: null,
  accounts: [],
  accountId: null,
  wallet: null,
  isSignedIn: false,
  signIn: async () => {
    throw Error("NearWalletContextProvider not initialized");
  },
  signOut: async () => {
    throw Error("NearWalletContextProvider not initialized");
  },
  signMessage: async () => {
    throw Error("NearWalletContextProvider not initialized");
  },
  getProvider: () => {
    throw Error("NearWalletContextProvider not initialized");
  },
});

// Export the context hook
export const useNearWallet = () => useContext(NearWalletContext);

// Provider component
export function NearWalletProvider({ children }: PropsWithChildren) {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<ReturnType<typeof setupModal> | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  // Initialize wallet selector
  useEffect(() => {
    const init = async () => {
      try {

        // Import wallet modules dynamically to avoid build errors
        const { setupNearWallet } = await import("@near-wallet-selector/near-wallet");
        const { setupHereWallet } = await import("@near-wallet-selector/here-wallet");
        const { setupMathWallet } = await import("@near-wallet-selector/math-wallet");
        const { setupNightly } = await import("@near-wallet-selector/nightly");
        const { setupMeteorWallet } = await import("@near-wallet-selector/meteor-wallet");
        const { setupLedger } = await import("@near-wallet-selector/ledger");
        const { setupCoin98Wallet } = await import("@near-wallet-selector/coin98-wallet");
        
        const selector = await setupWalletSelector({
          network: NEAR_NETWORK as NetworkId,
          modules: [
            // setupNearWallet() as any,
            // setupMyNearWallet(),
            // setupSender(),
            // setupHereWallet(),
            // setupMathWallet(),
            // setupNightly(),
            setupMeteorWallet() as any,
            // setupLedger(),
            // setupCoin98Wallet()
          ],
        });

        // Create modal with the contract ID
        const modal = setupModal(selector, {
          contractId: CONTRACT_ID
        });
        const state = selector.store.getState();
        setAccounts(state.accounts);

        // Set active wallet if user is already signed in
        if (state.accounts.length > 0) {
          const accountId = state.accounts[0].accountId;
          const wallet = await selector.wallet();
          setWallet(wallet);
        }

        // Subscribe to changes
        const subscription = selector.store.observable.subscribe((state) => {
          setAccounts(state.accounts);
          
          // Update wallet when accounts change
          if (state.accounts.length > 0) {
            (async () => {
              const wallet = await selector.wallet();
              setWallet(wallet);
            })();
          } else {
            setWallet(null);
          }
        });

        setSelector(selector);
        setModal(modal);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Failed to initialize wallet selector:", error);
      }
    };

    init();
  }, []);

  // Sign in function
  const signIn = useCallback(async () => {
    if (!modal) return;
    modal.show();
  }, [modal]);

  // Sign out function
  const signOut = useCallback(async () => {
    if (!wallet) return;
    await wallet.signOut();
    setWallet(null);
  }, [wallet]);

  // Sign message function
  const signMessage = useCallback(
    async (message: string) => {
      try {
        if (!wallet || !accounts[0]) {
            throw new Error("Wallet not connected");
        }

        // Check if the wallet supports message signing
        if (!wallet.signMessage) {
            throw new Error("This wallet doesn't support message signing");
        }

        // Convert message to Uint8Array
        const messageBytes = new TextEncoder().encode(message);
        
        // Generate a random nonce
        const nonceArray = crypto.getRandomValues(new Uint8Array(32));
        
        // Create the sign message params with proper typing
        const signMessageParams: SignMessageParams = {
          message: messageBytes as unknown as string, // Type cast to satisfy the API
          recipient: accounts[0].accountId,
          nonce: Buffer.from(nonceArray)
        };
        
        // Sign the message with required parameters
        const result = await wallet.signMessage(signMessageParams);

        if (!result || !result.signature) {
          throw new Error("Failed to get signature");
        }

        return {
          signature: Buffer.from(result.signature).toString("base64"),
        };
      } catch (error) {
        console.error("Error signing message:", error);
        throw error;
      }
    },
    [wallet, accounts]
  );

  // Get provider function
  const getProvider = useCallback(() => {
    if (!selector) return null;
    return new providers.JsonRpcProvider({ url: selector.options.network.nodeUrl });
  }, [selector]);

  // Context value
  const contextValue: NearWalletContext = {
    selector,
    modal,
    accounts,
    accountId: accounts.length > 0 ? accounts[0].accountId : null,
    wallet,
    isSignedIn: accounts.length > 0,
    signIn,
    signOut,
    signMessage,
    getProvider,
  };

  return (
    <NearWalletContext.Provider value={contextValue}>
      {children}
    </NearWalletContext.Provider>
  );
} 