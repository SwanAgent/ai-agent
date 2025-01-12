"use server";

import { z } from "zod";
import { ActionResponse, actionClient } from "@/lib/safe-action";
import { blockVisionClient } from "@/lib/services/block-vision";
import { PortfolioResponse, CoinDetailResponse } from "@/types/block-vision";

export const getWalletCoins = actionClient
  .schema(z.object({ walletAddress: z.string() }))
  .action<ActionResponse<PortfolioResponse['result']>>(
    async ({ parsedInput: { walletAddress } }) => {
      try {
        const data = await blockVisionClient.getWalletCoins(walletAddress);
        if(!data?.result) {
          return {
            success: false,
            error: "Failed to fetch wallet coins",
          };
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
        const data = await blockVisionClient.getCoinDetail(coinType);
        if(!data?.result) {
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