// "use client";

// import { useState, useEffect } from 'react';
// import { QuoteResponse } from "@7kprotocol/sdk-ts";
// import { useTransaction } from '@/hooks/use-transaction';
// import { fetchTokenDetails, fetchQuote, executeSwap, Token } from '@/lib/swap';

// type SwapState = {
//     isLoading: boolean;
//     isQuoteLoading: boolean;
//     isTokenDetailsLoading: boolean;
//     error: string | null;
//     quote: QuoteResponse | null;
//     fromToken: Token | null;
//     toToken: Token | null;
// };

// export function useSwap(swapData: {
//     fromTokenAddress?: string;
//     toTokenAddress?: string;
//     fromAmount?: string;
//     walletAddress?: string;
//     msgToolId: string;
// }) {
//     const { transaction, isLoading: isTransactionLoading, createTransaction, updateTransaction } = useTransaction(swapData.msgToolId, "SWAP");
//     const [state, setState] = useState<SwapState>({
//         isLoading: false,
//         isQuoteLoading: false,
//         isTokenDetailsLoading: false,
//         error: null,
//         quote: null,
//         fromToken: null,
//         toToken: null
//     });

//     const updateState = (newState: Partial<SwapState>) => {
//         setState(prev => ({ ...prev, ...newState }));
//     };

//     const fetchTokenDetailsWrapper = async () => {
//         if (!swapData.fromTokenAddress || !swapData.toTokenAddress) {
//             updateState({ error: 'Invalid token addresses' });
//             return;
//         }

//         try {
//             updateState({ isTokenDetailsLoading: true, error: null });
//             const result = await fetchTokenDetails(swapData.fromTokenAddress, swapData.toTokenAddress);
//             if (result) {
//                 updateState({ 
//                     fromToken: result.fromToken,
//                     toToken: result.toToken
//                 });
//             } else {
//                 updateState({ error: 'Failed to fetch token details' });
//             }
//         } finally {
//             updateState({ isTokenDetailsLoading: false });
//         }
//     };

//     const fetchQuoteWrapper = async (retry = false) => {
//         const { fromToken, toToken } = state;
//         if (!fromToken || !toToken || !swapData.fromAmount) {
//             updateState({ error: 'Missing required token information' });
//             return;
//         }

//         try {
//             updateState({ isQuoteLoading: true, error: null });
//             const quoteResponse = await fetchQuote(fromToken, toToken, swapData.fromAmount);
//             if (quoteResponse) {
//                 updateState({ quote: quoteResponse });
//             } else {
//                 updateState({ error: 'Failed to fetch quote' });
//                 if (!retry) {
//                     setTimeout(() => fetchQuoteWrapper(true), 2000);
//                 }
//             }
//         } finally {
//             updateState({ isQuoteLoading: false });
//         }
//     };

//     const handleSwap = async () => {
//         if (!swapData.walletAddress) {
//             updateState({ error: 'Please connect your wallet first' });
//             return;
//         }

//         if (!state.quote || !state.fromToken || !state.toToken || !swapData.fromAmount) {
//             updateState({ error: 'Quote not available' });
//             return;
//         }

//         try {
//             updateState({ isLoading: true, error: null });

//             // Create transaction record
//             await createTransaction({
//                 type: "SWAP",
//                 title: `Swapping ${swapData.fromAmount} ${state.fromToken.symbol} for ${state.quote.returnAmount} ${state.toToken.symbol}`,
//                 metadata: {
//                     fromAmount: swapData.fromAmount,
//                     fromToken: state.fromToken.address,
//                     fromSymbol: state.fromToken.symbol,
//                     toAmount: state.quote.returnAmount,
//                     toToken: state.toToken.address,
//                     toSymbol: state.toToken.symbol,
//                 }
//             });

//             const swapResult = await executeSwap(
//                 state.quote,
//                 swapData.walletAddress,
//                 state.fromToken,
//                 state.toToken,
//                 swapData.fromAmount
//             );

//             if (!swapResult.success) {
//                 throw new Error(swapResult.error || 'Swap failed');
//             }

//             await updateTransaction({
//                 hash: swapResult.digest,
//                 status: "SUCCESS"
//             });

//             return swapResult;
//         } catch (err: any) {
//             await updateTransaction({
//                 status: "FAILED"
//             });
//             updateState({ error: err.message || 'Swap failed' });
//             return null;
//         } finally {
//             updateState({ isLoading: false });
//         }
//     };

//     useEffect(() => {
//         fetchTokenDetailsWrapper();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [swapData.fromTokenAddress, swapData.toTokenAddress]);

//     useEffect(() => {
//         if (state.fromToken && state.toToken && !state.isTokenDetailsLoading) {
//             fetchQuoteWrapper();
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [state.fromToken, state.toToken, state.isTokenDetailsLoading]);

//     return {
//         ...state,
//         refreshQuote: fetchQuoteWrapper,
//         handleSwap,
//         transaction,
//         isTransactionLoading,
//     };
// } 