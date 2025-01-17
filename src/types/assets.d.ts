import { CoinStruct } from "@mysten/sui/client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type AssetType = {
  blockchain: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenType: string;
  holderAddress: string;
  balance: string;
  balanceRawInteger: string;
  balanceUsd: string;
  tokenPrice: number;
  thumbnail: string;
  tokenBalance: number;
}

export type TokenMetadata = {
  blockchain: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  thumbnail: string;
}

export type CoinObject = {
  objectId: string;
  type: string;
  symbol: string;
  balance: bigint;
  lockedUntilEpoch: number | null | undefined;
  previousTransaction: string;
  object: CoinStruct; 
};