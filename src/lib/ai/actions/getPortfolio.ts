import { ActionResponse } from "@/types/actions";
import { z } from "zod";
import { Coin } from "@/types/block-vision";
import { PortfolioResponse } from "@/types/block-vision";
import { getWalletCoins } from "@/server/actions/block-vision";

export const getPortfolioSchema = z.object({
    walletAddress: z.string(),
});

export type GetPortfolioParams = z.infer<typeof getPortfolioSchema>;
export type GetPortfolioResult = ActionResponse<PortfolioResponse['result']>;

export const getPortfolio = {
    description: 'Get the portfolio of a wallet on sui chain',
    parameters: getPortfolioSchema,
    execute: async ({ walletAddress }: GetPortfolioParams): Promise<GetPortfolioResult> => {
        try {
            const response = await getWalletCoins({walletAddress});
            const data = response?.data?.data;

            if (!data || data?.coins.length === 0) {    
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
                    usdValue: data.usdValue,
                    coins: data.coins.filter((coin: Coin) => coin.verified),
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