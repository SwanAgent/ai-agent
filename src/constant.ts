export const NEAR_NETWORK: "testnet" | "mainnet" = "mainnet";
export const CONTRACT_ID = "test.testnet";
export const NODE_URL = NEAR_NETWORK === "mainnet" ? "https://rpc.near.org" : "https://rpc.testnet.near.org";