// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ArrowRight, RefreshCw } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useWallet } from '@suiet/wallet-kit';
// import { getQuote, buildTx, QuoteResponse } from "@7kprotocol/sdk-ts";
// import { SwapQuote, ActionComponentProps } from '@/types/actions';
// import { SwapTokenResponse } from '@/lib/ai/actions/swapToken';
// import { toSmall } from '@/utils/token-converter';
// import { CoinDetail } from '@/types/block-vision';
// import { getCoinDetail } from '@/server/actions/block-vision';
// import Image from 'next/image';

// const PARTNER_ADDRESS = "0xe43e24ca022903581290d7a47a8f3123b6e1b072bbdbbfd096b564625c5e1502";

// type SwapState = {
//   isLoading: boolean;
//   isQuoteLoading: boolean;
//   isTokenDetailsLoading: boolean;
//   error: string | null;
//   quote: QuoteResponse | null;
//   fromToken: CoinDetail | null;
//   toToken: CoinDetail | null;
// };

// type SwapProps = ActionComponentProps<SwapTokenResponse> & {
//   msgToolId: string;
// };

// export function SwapToken({ result, isLoading: isLoadingProp, msgToolId }: SwapProps) {
//   const { account } = useWallet();
//   const [state, setState] = useState<SwapState>({
//     isLoading: false,
//     isQuoteLoading: false,
//     isTokenDetailsLoading: false,
//     error: null,
//     quote: null,
//     fromToken: null,
//     toToken: null
//   });

//   const updateState = (newState: Partial<SwapState>) => {
//     setState(prev => ({ ...prev, ...newState }));
//   };

//   const fetchTokenDetails = async () => {
//     if (!result?.data?.fromTokenAddress || !result?.data?.toTokenAddress) {
//       updateState({ error: 'Invalid token addresses' });
//       return;
//     }

//     try {
//       updateState({ isTokenDetailsLoading: true, error: null });
//       const [fromDetails, toDetails] = await Promise.all([
//         getCoinDetail({ coinType: result.data.fromTokenAddress }),
//         getCoinDetail({ coinType: result.data.toTokenAddress })
//       ]);

//       if (fromDetails?.data?.error || toDetails?.data?.error) {
//         throw new Error('Failed to fetch coin details');
//       }

//       updateState({
//         fromToken: fromDetails?.data?.data ?? null,
//         toToken: toDetails?.data?.data ?? null
//       });
//     } catch (err) {
//       updateState({ error: 'Failed to fetch token details' });
//     } finally {
//       updateState({ isTokenDetailsLoading: false });
//     }
//   };

//   const fetchQuote = async (retry = false) => {
//     const { fromToken, toToken } = state;
//     const { fromAmount, fromTokenAddress, toTokenAddress } = result?.data ?? {};

//     if (!fromToken || !toToken || !fromAmount || !fromTokenAddress || !toTokenAddress) {
//       updateState({ error: 'Missing required token information' });
//       return;
//     }

//     try {
//       updateState({ isQuoteLoading: true, error: null });
//       const decimals = fromToken.decimals ?? 9;
//       const adjustedAmount = toSmall(fromAmount.toString(), decimals);

//       const adjustedSwapParams: SwapQuote = {
//         tokenIn: fromTokenAddress,
//         tokenOut: toTokenAddress,
//         amountIn: adjustedAmount,
//       };

//       const quoteResponse = await getQuote(adjustedSwapParams);
//       updateState({ quote: quoteResponse });
//     } catch (err) {
//       updateState({ error: 'Failed to fetch quote' });
//       if (!retry) {
//         // Retry once after a short delay
//         setTimeout(() => fetchQuote(true), 2000);
//       }
//     } finally {
//       updateState({ isQuoteLoading: false });
//     }
//   };

//   const handleSwap = async () => {
//     if (!account?.address) {
//       updateState({ error: 'Please connect your wallet first' });
//       return;
//     }

//     if (!state.quote) {
//       updateState({ error: 'Quote not available' });
//       return;
//     }

//     try {
//       updateState({ isLoading: true, error: null });
//       const result = await buildTx({
//         quoteResponse: state.quote,
//         accountAddress: account.address,
//         slippage: 0.01,
//         commission: {
//           partner: PARTNER_ADDRESS,
//           commissionBps: 0,
//         },
//       });

//       if (!result?.tx) {
//         throw new Error('Failed to build transaction');
//       }

//       // Handle successful transaction build
//       console.log("Transaction built successfully:", result);
//     } catch (err: any) {
//       updateState({ error: err.message || 'Swap failed' });
//     } finally {
//       updateState({ isLoading: false });
//     }
//   };

//   useEffect(() => {
//     const init = async () => {
//       await fetchTokenDetails();
//     };
//     init();
//   }, [result?.data]);

//   useEffect(() => {
//     if (state.fromToken && state.toToken && !state.isTokenDetailsLoading) {
//       fetchQuote();
//     }
//   }, [state.fromToken, state.toToken, state.isTokenDetailsLoading]);

//   const isInitializing = state.isTokenDetailsLoading || isLoadingProp;
//   const isActionDisabled = state.isLoading || state.isQuoteLoading || isInitializing || !state.quote;

//   return (
//     <Card className={cn('mt-3 overflow-hidden w-full')}>
//       <CardHeader className="border-b">
//         <CardTitle className="flex items-center justify-between">
//           <span>Swap</span>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => fetchQuote()}
//             disabled={isActionDisabled}
//           >
//             <RefreshCw className={cn(
//               "h-4 w-4",
//               (state.isQuoteLoading || isInitializing) && "animate-spin"
//             )} />
//           </Button>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-6">
//         <div className="flex flex-col gap-6">
//           {isInitializing ? (
//             <div className="text-center text-muted-foreground animate-pulse">
//               Loading token details...
//             </div>
//           ) : state.error ? (
//             <div className="text-center text-red-500">
//               {state.error}
//             </div>
//           ) : (
//             <>
//               <div className="flex items-center justify-between gap-4">
//                 <div className="flex items-center gap-2">
//                   <div className="relative w-10 h-10 rounded-full overflow-hidden">
//                     {state.fromToken?.logo && (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={state.fromToken.logo}
//                         alt={state.fromToken.symbol || "token"}
//                         className="w-full h-full"
//                       />
//                     )}
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-sm text-muted-foreground">From</span>
//                     <span className="font-medium">
//                       {result?.data?.fromAmount} {state.fromToken?.symbol ?? result?.data?.fromTokenAddress}
//                     </span>
//                     {state.fromToken && (
//                       <span className="text-xs text-muted-foreground">
//                         ≈ ${(Number(result?.data?.fromAmount) * Number(state.fromToken?.price)).toFixed(2)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <ArrowRight className="h-4 w-4 text-muted-foreground" />
//                 <div className="flex items-center gap-2">
//                   <div className="relative w-10 h-10 rounded-full overflow-hidden">
//                     {state.toToken?.logo && (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={state.toToken.logo}
//                         alt={state.toToken.symbol || "token"}
//                         className="w-full h-full"
//                       />
//                     )}
//                   </div>
//                   <div className="flex flex-col items-end">
//                     <span className="text-sm text-muted-foreground">To</span>
//                     {state.isQuoteLoading ? (
//                       <span className="text-sm animate-pulse">Fetching quote...</span>
//                     ) : (
//                       <>
//                         <span className="font-medium">
//                           {state.quote?.returnAmount} {state.toToken?.symbol ?? result?.data?.toTokenAddress}
//                         </span>
//                         {state.toToken && state.quote?.returnAmount && (
//                           <span className="text-xs text-muted-foreground">
//                             ≈ ${(Number(state.quote.returnAmount) * Number(state.toToken.price)).toFixed(2)}
//                           </span>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <Button
//                 onClick={handleSwap}
//                 disabled={isActionDisabled}
//                 className={cn(
//                   "w-full",
//                   (state.isLoading || state.isQuoteLoading) && "animate-pulse"
//                 )}
//               >
//                 {state.isLoading ? 'Processing Swap...' :
//                   state.isQuoteLoading ? 'Fetching Quote...' :
//                     state.isTokenDetailsLoading ? 'Loading Token Details...' :
//                       !account?.address ? 'Connect Wallet' :
//                         !state.quote ? 'Quote Unavailable' :
//                           `Swap`}
//               </Button>

//               <a
//                 href="https://port.7k.ag"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-xs text-muted-foreground text-center hover:text-muted-foreground/80"
//               >
//                 Powered by 7K Aggregator
//               </a>
//             </>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }