import { z } from 'zod';
import { ActionResponse } from '@/types/actions';
import { executeSwap, fetchQuote } from '@/lib/swap';
import { ToolConfig } from '.';
import { ToolExecutionOptions } from 'ai';
import { getOrCreateTransaction, updateTransactionStatus } from '@/server/actions/transaction';
import { getUserByWalletAddress } from '@/server/db/queries';
import { searchToken } from '@/lib/swap/searchToken';

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
    description: 'Automatically swap tokens on NEAR chain without requiring user interaction. The fromAmount and walletAddress parameters are required. If no fromToken is specified, NEAR will be used as the default. You can provide token name, symbol, or address for both fromToken and toToken parameters.',
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

            const fromTokenDetailsResult = searchToken(fromToken)[0];
            const toTokenDetailsResult = searchToken(toToken)[0];

            if (!fromTokenDetailsResult || !toTokenDetailsResult) {
                return {
                    success: false,
                    error: !fromTokenDetailsResult ? `Failed to find details about ${fromToken} on NEAR chain` : `Failed to find details about ${toToken} on NEAR chain`,
                };
            }

            const quote = await fetchQuote(fromTokenDetailsResult, toTokenDetailsResult, fromAmount.toString(), walletAddress);
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
                title: `Swapping ${fromAmount} ${fromTokenDetailsResult.symbol} for ${quote.totalAmountOut} ${toTokenDetailsResult.symbol}`,
                metadata: {
                    fromAmount,
                    fromToken: fromTokenDetailsResult.id,
                    fromSymbol: fromTokenDetailsResult.symbol,
                    toAmount: quote.totalAmountOut,
                    toToken: toTokenDetailsResult.id,
                    toSymbol: toTokenDetailsResult.symbol,
                },
            });

            const swapResult = await executeSwap(
                quote.tokenIn,
                quote.tokenOut,
                walletAddress,
                fromAmount.toString()
            );

            if (!swapResult.success) {
                await updateTransactionStatus({
                    msgToolId: options?.toolCallId,
                    input: {
                        status: 'FAILED',
                        hash: swapResult.hash,
                        title: `Failed to swap ${fromAmount} ${fromTokenDetailsResult.symbol} for ${quote.totalAmountOut} ${toTokenDetailsResult.symbol}`,
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
                    hash: swapResult.hash,
                    title: `Swapped ${fromAmount} ${fromTokenDetailsResult.symbol} for ${quote.totalAmountOut} ${toTokenDetailsResult.symbol}`,
                },
            });

            console.log('swapResult', {
                hash: swapResult.hash,
                fromAmount,
                fromToken: fromTokenDetailsResult.symbol,
                toToken: toTokenDetailsResult.symbol,
                toAmount: quote.totalAmountOut,
            });
            return {
                success: true,
                data: {
                    digest: swapResult.hash ?? "",
                    fromAmount,
                    fromToken: fromTokenDetailsResult.symbol,
                    toToken: toTokenDetailsResult.symbol,
                    toAmount: quote.totalAmountOut,
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
            console.log("error", error)
            return {
                success: false,
                error: error.message || "Failed to execute automated swap",
            };
        }
    },
}; 