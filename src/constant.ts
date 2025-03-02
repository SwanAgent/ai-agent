export const NEAR_NETWORK: "testnet" | "mainnet" = "testnet";
export const CONTRACT_ID = "test.testnet";
export const NODE_URL = NEAR_NETWORK === 'testnet' ? "https://rpc.testnet.near.org" : "https://rpc.near.org";