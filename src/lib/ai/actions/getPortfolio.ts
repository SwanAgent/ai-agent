import { ActionResponse } from "@/types/actions";
import { AssetType } from "@/types/assets";
import { z } from "zod";
const url = 'https://api.leapwallet.io/proxy/ankr';
const supportedChains = ['base'];


export const getPortfolioSchema = z.object({
    walletAddress: z.string(),
});

export type GetPortfolioParams = z.infer<typeof getPortfolioSchema>;
export type GetPortfolioResponse = {
    id: number;
    jsonrpc: string;
    result: {
        totalBalanceUsd: string;
        totalCount: number;
        assets: AssetType[];
    };
}
export type GetPortfolioResult = ActionResponse<GetPortfolioResponse['result']>;


export const getPortfolio = {
    description: 'Get the portfolio of a wallet on base chain',
    parameters: getPortfolioSchema,
    execute: async ({ walletAddress }: GetPortfolioParams): Promise<GetPortfolioResult> => {
        try {
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        nativeFirst: true,
                        walletAddress: walletAddress,
                        blockchains: supportedChains,
                        currency: 'USD',
                    }
                ),
            });
            const data: GetPortfolioResponse = await response.json();

            if (!data?.result || data?.result?.totalCount === 0) {
                return {
                    success: true,
                    suppressFollowUp: true,
                    data: {
                        totalBalanceUsd: '0',
                        totalCount: 0,
                        assets: [{
                            blockchain: 'base',
                            tokenName: 'Ether',
                            tokenSymbol: 'ETH',
                            tokenDecimals: 18,
                            tokenType: 'NATIVE',
                            holderAddress: walletAddress,
                            balance: '0',
                            balanceRawInteger: '0',
                            balanceUsd: '0',
                            tokenPrice: 0,
                            thumbnail: '',
                            tokenBalance: 0,
                        }],
                    }
                }
            }

            return {
                success: true,
                suppressFollowUp: true,
                data: data.result,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Can not fetch portfolio at the moment. Please try again later.',
            };
        }
    }
}