import { z } from "zod";
import { ActionResponse } from "@/types/actions";

export interface TopGainerToken {
    coin: string;
    pool: string;
    price4hAgo: number;
    price: number;
    priceChange4h: number;
    coinMetadata: {
        coinType: string;
        name: string;
        symbol: string;
        decimals: number;
        iconUrl: string;
        supply: number;
    };
}

const getTopGainersSchema = z.object({
    limit: z.number().min(1).max(25).default(20).describe("Number of top gainer tokens to return. Maximum 25."),
});

export type GetTopGainersSchema = z.infer<typeof getTopGainersSchema>;
export type GetTopGainersResponse = ActionResponse<{
    tokens: TopGainerToken[];
}>;

export const getTopGainers = {
    description: "Get top gainer tokens on the SUI network sorted by price increase in the last 4 hours.",
    parameters: getTopGainersSchema,
    execute: async ({ limit }: GetTopGainersSchema): Promise<GetTopGainersResponse> => {
        try {
            const response = await fetch(`https://api-ex.insidex.trade/coins/top-gainers`, {
                headers: {
                    'x-api-key': process.env.INSIDE_X_API_KEY as string,
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch top gainer tokens');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                return {
                    success: false,
                    error: "Invalid response format from top gainers API",
                };
            }

            return {
                success: true,
                data: {
                    tokens: data.slice(0, limit),
                },
            };
        } catch (error) {
            console.error("Error fetching top gainer tokens:", error);
            return {
                success: false,
                error: "Failed to fetch top gainer tokens",
            };
        }
    }
}; 