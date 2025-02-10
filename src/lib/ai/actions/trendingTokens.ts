import { z } from "zod";
import { ActionResponse } from "@/types/actions";
import { ToolConfig } from ".";

export interface TrendingToken {
    coinPrice: string;
    coinMetadata: {
        coinType: string;
        name: string;
        symbol: string;
        description: string;
        iconUrl: string;
        decimals: string;
    };
    marketCap: string;
    volume24h: string;
    percentagePriceChange24h: string;
    totalLiquidityUsd: string;
    top10HolderPercentage: string;
}

const getTrendingTokensSchema = z.object({
    limit: z.number().min(1).max(25).default(20).describe("Number of trending tokens to return. Maximum 25."),
});

export type GetTrendingTokensSchema = z.infer<typeof getTrendingTokensSchema>;
export type GetTrendingTokensResponse = ActionResponse<{
    tokens: TrendingToken[];
}>;

export const getTrendingTokens: ToolConfig = {
    displayName: '🔍 Get Trending Tokens',
    description: "Get trending tokens on the SUI network sorted by various metrics like volume, price change, and market cap.",
    parameters: getTrendingTokensSchema,
    execute: async ({ limit }: GetTrendingTokensSchema): Promise<GetTrendingTokensResponse> => {
        try {
            const response = await fetch(`https://api-ex.insidex.trade/coins/trending`, {
                headers: {
                    'x-api-key': process.env.INSIDE_X_API_KEY as string,
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch trending tokens');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                return {
                    success: false,
                    error: "Invalid response format from trending tokens API",
                };
            }

            return {
                success: true,
                data: {
                    tokens: data.slice(0, limit),
                },
            };
        } catch (error) {
            console.error("Error fetching trending tokens:", error);
            return {
                success: false,
                error: "Failed to fetch trending tokens",
            };
        }
    }
};
