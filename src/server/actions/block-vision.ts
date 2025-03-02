"use server";

import { z } from "zod";
import { ActionResponse, actionClient } from "@/lib/safe-action";
import { PortfolioResponse, CoinDetailResponse } from "@/types/block-vision";

const BASE_URL = 'https://api.blockvision.org/v2/sui';
const API_KEY = process.env.BLOCK_VISION_API_KEY!;

async function blockVisionFetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'x-api-key': API_KEY,
        },
    });
    return response.json();
}

export const getWalletCoins = actionClient
  .schema(z.object({ walletAddress: z.string() }))
  .action<ActionResponse<PortfolioResponse['result']>>(
    async ({ parsedInput: { walletAddress } }) => {
      try {
        const data = await blockVisionFetch<PortfolioResponse>(`/account/coins?account=${walletAddress}`);
        if (!data?.result) {
          return {
            success: false,
            error: "Failed to fetch wallet coins",
          };
        }

        if (data.result.coins.length === 0) {
          data.result.coins = [{
            coinType: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
            name: 'Sui',
            symbol: 'SUI',
            decimals: 9,
            balance: '0',
            usdValue: '0',
            price: '0',
            priceChangePercentage24H: '0',
            objects: 0,
            scam: false,
            verified: true,
            logo: 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/sui-coin.svg/public',
          }]
        }

        return {
          success: true,
          data: data.result,
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to fetch wallet coins",
        };
      }
    }
  );

export const getCoinDetail = actionClient
  .schema(z.object({ coinType: z.string() }))
  .action<ActionResponse<CoinDetailResponse['result']>>(
    async ({ parsedInput: { coinType } }) => {
      try {
        const encodedCoinType = encodeURIComponent(coinType);
        const data = await blockVisionFetch<CoinDetailResponse>(`/coin/detail?coinType=${encodedCoinType}`);
        if (!data?.result) {
          return {
            success: false,
            error: "Failed to fetch coin details",
          };
        }
        return {
          success: true,
          data: data.result,
        };
      } catch (error) {
        console.log("error fetching coin details", error);
        return {
          success: false,
          error: "Failed to fetch coin details",
        };
      }
    }
  ); 