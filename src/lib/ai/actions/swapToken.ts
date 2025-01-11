import { z } from 'zod';
import { searchTokenDetails } from '@/lib/ai/actions/searchTokenDetails';
import { ActionResponse } from '@/types/actions';

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

// If some random token other than ETH is mentioned, ask for the correct token address before proceeding. Do not assume the token address on your own, always ask for the correct token address from user.

export const swapTokens = {
    description: 'Swap tokens on base chains. Use ETH as fromToken when using this function for buying any token. just send the token name or symbol or address as inputs for fromToken and toToken. It finds ',
    parameters: swapSchema,
    execute: async ({ fromAmount, fromToken, toToken }: SwapTokenSchema): Promise<SwapTokenResponse> => {
        try {
            const fromTokenDetailsResult = fromToken === 'ETH' ? 'ETH' : (await searchTokenDetails.execute({ query: fromToken }))?.data?.address;
            console.log(fromTokenDetailsResult);

            const toTokenDetailsResult = toToken === 'ETH' ? 'ETH' : (await searchTokenDetails.execute({ query: toToken }))?.data?.address;
            console.log(toTokenDetailsResult);

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
