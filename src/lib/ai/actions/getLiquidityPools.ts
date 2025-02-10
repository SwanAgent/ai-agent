import { z } from 'zod';
import { ActionResponse } from '@/types/actions';
import { ToolConfig } from '.';
import { searchTokenAddress } from '../helpers/searchTokenAddress';

export type Pool = {
    address: string;
    symbol: string;
    price: string;
    tvl: string;
    verified: boolean;
    tokenA: {
        amount: string;
        info: {
            address: string;
            decimals: number;
            isVerified: boolean;
            logoURI: string;
            name: string;
            symbol: string;
        }
    };
    tokenB: {
        amount: string;
        info: {
            address: string;
            decimals: number;
            isVerified: boolean;
            logoURI: string;
            name: string;
            symbol: string;
        }
    };
    day: {
        apr: {
            total: string;
        };
        volume: string;
    };
    week: {
        apr: {
            total: string;
        };
        volume: string;
    };
    month: {
        apr: {
            total: string;
        };
        volume: string;
    };
};

export const getLiquidityPoolsSchema = z.object({
    tokenQuery: z.string().describe('The token to get liquidity pools for. Can be name, symbol or address'),
    sortBy: z.enum(['tvl', 'dayApy', 'weekApy', 'monthApy']).default('tvl').describe('How to sort the pools'),
});

export type GetLiquidityPoolsParams = z.infer<typeof getLiquidityPoolsSchema>;
export type GetLiquidityPoolsResponse = ActionResponse<{
    pools: Pool[];
}>;

export const getLiquidityPools: ToolConfig = {
    displayName: '💧 Get Liquidity Pools',
    description: 'Get liquidity pools for a token on SUI chain. You can provide token name, symbol, or address.',
    parameters: getLiquidityPoolsSchema,
    execute: async ({ tokenQuery, sortBy }: GetLiquidityPoolsParams): Promise<GetLiquidityPoolsResponse> => {
        try {
            const tokenAddress = await searchTokenAddress(tokenQuery);
            if (!tokenAddress) {
                return {
                    success: false,
                    error: `Failed to find token details for ${tokenQuery}. Please provide a valid token name, symbol, or address.`,
                };
            }

            const response = await fetch(`https://swap.api.sui-prod.bluefin.io/api/v1/pools/info?token=${tokenAddress}`);
            const pools: Pool[] = await response.json();

            // Sort pools based on the sortBy parameter
            const sortedPools = pools.sort((a, b) => {
                if (sortBy === 'tvl') {
                    return parseFloat(b.tvl) - parseFloat(a.tvl);
                } else if (sortBy === 'dayApy') {
                    return parseFloat(b.day.apr.total) - parseFloat(a.day.apr.total);
                } else if (sortBy === 'weekApy') {
                    return parseFloat(b.week.apr.total) - parseFloat(a.week.apr.total);
                } else {
                    return parseFloat(b.month.apr.total) - parseFloat(a.month.apr.total);
                }
            });

            return {
                success: true,
                data: {
                    pools: sortedPools,
                },
            };
        } catch (error) {
            console.error('Error fetching liquidity pools:', error);
            return {
                success: false,
                error: 'Failed to fetch liquidity pools',
            };
        }
    },
}; 