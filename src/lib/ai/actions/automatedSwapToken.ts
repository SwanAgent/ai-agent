import { z } from 'zod';
import { searchTokenDetails } from '@/lib/ai/actions/searchTokenDetails';
import { ActionResponse } from '@/types/actions';
import { fetchTokenDetails, fetchQuote, executeSwap } from '@/lib/swap';
import { ToolConfig } from '.';
import { ToolExecutionOptions } from 'ai';
import { getOrCreateTransaction, updateTransactionStatus } from '@/server/actions/transaction';
import { getUserByWalletAddress } from '@/server/db/queries';

export const automatedSwapSchema = z.object({
    fromAmount: z.number(),
    fromToken: z.string(),
    toToken: z.string(),
    walletAddress: z.string(),
});

export type AutomatedSwapSchema = z.infer<typeof automatedSwapSchema>;
export type AutomatedSwapResponse = ActionResponse<{
    digest?: string;
    fromAmount: number;
    fromToken: string;
    toToken: string;
    toAmount?: string;
    error?: string;
}>;

export const automatedSwapToken: ToolConfig = {
    displayName: '🔄 Swap Token',
    description: 'Automatically swap tokens on SUI chains without requiring user interaction. The fromAmount and walletAddress parameters are required. If no fromToken is specified, SUI will be used as the default. You can provide token name, symbol, or address for both fromToken and toToken parameters.',
    parameters: automatedSwapSchema,
    execute: async ({ fromAmount, fromToken, toToken, walletAddress }: AutomatedSwapSchema, options?: ToolExecutionOptions): Promise<AutomatedSwapResponse> => {
        if (!options?.toolCallId) {
            return {
                success: false,
                error: 'Could not initialize transaction',
            };
        }

        try {
            const getUser = await getUserByWalletAddress({ walletAddress });
            if (!getUser) {
                return {
                    success: false,
                    error: 'Could not create a transaction for this wallet address',
                };
            }

            const fromTokenDetailsResult = fromToken === 'SUI' ? '0x2::sui::SUI' : (await searchTokenDetails?.execute({ query: fromToken }))?.data?.address;
            const toTokenDetailsResult = toToken === 'SUI' ? '0x2::sui::SUI' : (await searchTokenDetails?.execute({ query: toToken }))?.data?.address;

            if (!fromTokenDetailsResult || !toTokenDetailsResult) {
                return {
                    success: false,
                    error: !fromTokenDetailsResult ? `Failed to find details about ${fromToken} on SUI chain` : `Failed to find details about ${toToken} on SUI chain`,
                };
            }

            const tokenDetails = await fetchTokenDetails(fromTokenDetailsResult, toTokenDetailsResult);
            if (!tokenDetails) {
                return {
                    success: false,
                    error: 'Failed to fetch token details',
                };
            }

            const quote = await fetchQuote(tokenDetails.fromToken, tokenDetails.toToken, fromAmount.toString());
            if (!quote) {
                return {
                    success: false,
                    error: 'Failed to fetch quote',
                };
            }

            const _transaction = await getOrCreateTransaction({
                usedId: getUser.id,
                msgToolId: options?.toolCallId,
                type: 'SWAP',
                title: `Swapping ${fromAmount} ${tokenDetails.fromToken.symbol} for ${quote.returnAmount} ${tokenDetails.toToken.symbol}`,
                metadata: {
                    fromAmount,
                    fromToken: tokenDetails.fromToken.address,
                    fromSymbol: tokenDetails.fromToken.symbol,
                    toAmount: quote.returnAmount,
                    toToken: tokenDetails.toToken.address,
                    toSymbol: tokenDetails.toToken.symbol,
                },
            });

            const swapResult = await executeSwap(
                quote,
                walletAddress,
                tokenDetails.fromToken,
                tokenDetails.toToken,
                fromAmount
            );

            if (!swapResult.success) {
                await updateTransactionStatus({
                    msgToolId: options?.toolCallId,
                    input: {
                        status: 'FAILED',
                        hash: swapResult.digest,
                        title: `Failed to swap ${fromAmount} ${tokenDetails.fromToken.symbol} for ${quote.returnAmount} ${tokenDetails.toToken.symbol}`,
                    },
                });

                return {
                    success: false,
                    error: swapResult.error || 'Swap failed',
                };
            }

            await updateTransactionStatus({
                msgToolId: options?.toolCallId,
                input: {
                    status: 'SUCCESS',
                    hash: swapResult.digest,
                    title: `Swapped ${fromAmount} ${tokenDetails.fromToken.symbol} for ${quote.returnAmount} ${tokenDetails.toToken.symbol}`,
                },
            });

            console.log('swapResult', {
                digest: swapResult.digest,
                fromAmount,
                fromToken: tokenDetails.fromToken.symbol,
                toToken: tokenDetails.toToken.symbol,
                toAmount: swapResult.quote?.returnAmount,
            });
            return {
                success: true,
                data: {
                    digest: swapResult.digest,
                    fromAmount,
                    fromToken: tokenDetails.fromToken.symbol,
                    toToken: tokenDetails.toToken.symbol,
                    toAmount: swapResult.quote?.returnAmount,
                },
            };
        } catch (error: any) {
            await updateTransactionStatus({
                msgToolId: options?.toolCallId,
                input: {
                    status: 'FAILED',
                    title: `Failed to execute the swap`,
                },
            });

            return {
                success: false,
                error: error.message || "Failed to execute automated swap",
            };
        }
    },
}; 