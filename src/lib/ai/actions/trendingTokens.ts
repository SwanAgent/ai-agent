import { z } from "zod";
import { ActionResponse } from "@/types/actions";
import { ToolConfig } from ".";

export interface TrendingToken {
    contract: string;
    name: string;
    symbol: string;
    decimals: number,
    icon: string,
    reference: string | null,
    price: string | null,
    total_supply: string,
    onchain_market_cap: string,
    change_24: string,
    market_cap: string,
    volume_24h: string;
}

const getTrendingTokensSchema = z.object({
    // limit: z.number().min(1).max(25).default(20).describe("Number of trending tokens to return. Maximum 25."),
});

export type GetTrendingTokensSchema = z.infer<typeof getTrendingTokensSchema>;
export type GetTrendingTokensResponse = ActionResponse<{
    tokens: TrendingToken[];
}>;

export const getTrendingTokens: ToolConfig = {
    displayName: '🔍 Get Trending Tokens',
    description: "Get trending tokens on the SUI network sorted by various metrics like volume, price change, and market cap.",
    parameters: getTrendingTokensSchema,
    execute: async ({  }: GetTrendingTokensSchema): Promise<GetTrendingTokensResponse> => {
        try {
            console.log("Fetching trending tokens");
            const response = await fetch(`https://api.nearblocks.io/v1/fts?page=1&per_page=25&sort=change&order=desc`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NEARBLOCKS_API_KEY as string}`,
                },
            });
            console.log("Response", response);
            if (!response.ok) {
                console.log("Failed to fetch trending tokens");
                throw new Error('Failed to fetch trending tokens');
            }

            const data = await response.json();
            console.log("Data", data);
            if (!data || !data.tokens) {
                return {
                    success: false,
                    error: "Invalid response format from trending tokens API",
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error) {
            console.log("Error fetching trending tokens:", error);
            return {
                success: false,
                error: "Failed to fetch trending tokens",
            };
        }
    }
};
