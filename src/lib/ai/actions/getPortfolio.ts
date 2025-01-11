import { ActionResponse } from "@/types/actions";
import { Coin } from "@/types/coin";
import { z } from "zod";
const url = 'https://api.blockvision.org/v2/sui';

export const getPortfolioSchema = z.object({
    walletAddress: z.string(),
});

export type GetPortfolioParams = z.infer<typeof getPortfolioSchema>;
export type GetPortfolioResponse = {
    code: number;
    message: string;
    result: {
        coins: Coin[];
        usdValue: string;
    };
}
export type GetPortfolioResult = ActionResponse<GetPortfolioResponse['result']>;

export const getPortfolio = {
    description: 'Get the portfolio of a wallet on sui chain',
    parameters: getPortfolioSchema,
    execute: async ({ walletAddress }: GetPortfolioParams): Promise<GetPortfolioResult> => {
        try {
            const response = await fetch(`${url}/account/coins?account=${walletAddress}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'x-api-key': process.env.BLOCKVISION_API_KEY ?? '',
                },
            });
            const data: GetPortfolioResponse = await response.json();

            if (!data?.result || data?.result?.coins.length === 0) {    
                return {
                    success: true,
                    suppressFollowUp: true,
                    data: {
                        coins: [{
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
                        }],
                        usdValue: '0',
                    }
                }
            }

            return {
                success: true,
                suppressFollowUp: true,
                data: {
                    usdValue: data.result.usdValue,
                    coins: data.result.coins.filter((coin) => coin.verified),
                },
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Can not fetch portfolio at the moment. Please try again later.',
            };
        }
    }
}