import { z } from 'zod';
import { searchTokenDetails } from '@/lib/ai/actions/searchTokenDetails';
import { ActionResponse } from '@/types/actions';
import { ToolConfig } from '.';

export const swapSchema = z.object({
    fromAmount: z.number(),
    fromToken: z.string(),
    toToken: z.string(),
});
export type SwapTokenSchema = z.infer<typeof swapSchema>;
export type SwapTokenResponse = ActionResponse<{
    fromTokenAddress: string;
    toTokenAddress: string;
    fromAmount: number;
}>;

export const swapTokens: ToolConfig = {
    displayName: '🔄 Swap Token',
    description: 'Swap tokens on SUI chains. The fromAmount parameter is required. If no fromToken is specified, SUI will be used as the default. You can provide token name, symbol, or address for both fromToken and toToken parameters. For buying any token, it\'s recommended to use SUI as the fromToken.',
    parameters: swapSchema,
    execute: async ({ fromAmount, fromToken, toToken }: SwapTokenSchema): Promise<SwapTokenResponse> => {
        try {
            const fromTokenDetailsResult = fromToken === 'SUI' ? '0x2::sui::SUI' : (await searchTokenDetails.execute({ query: fromToken }))?.data?.address;
            const toTokenDetailsResult = toToken === 'SUI' ? '0x2::sui::SUI' : (await searchTokenDetails.execute({ query: toToken }))?.data?.address;

            if (!fromTokenDetailsResult || !toTokenDetailsResult) {
                return {
                    success: false,
                    error: !fromTokenDetailsResult ? `Failed to find details about ${fromToken} on Base chain. Please give a valid token name/symbol/address.` : `Failed to find details about ${toToken} on Base chain. Please give a valid token name/symbol/address.`,
                };
            }

            return {
                success: true,
                signTransaction: true,
                data: {
                    fromAmount,
                    fromTokenAddress: fromTokenDetailsResult,
                    toTokenAddress: toTokenDetailsResult
                },
            };
        } catch (error) {
            return {
                success: false,
                error: "Failed to swap tokens",
            };
        }
    },
};
