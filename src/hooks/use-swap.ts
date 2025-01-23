"use client";

import { useState, useEffect } from 'react';
import { getQuote, buildTx, QuoteResponse, getTokenPrices } from "@7kprotocol/sdk-ts";
import { SwapQuote } from '@/types/actions';
import { toSmall } from '@/utils/token-converter';
import { getCoinDetail } from '@/server/actions/block-vision';
import { getTokenFromRegistry } from '@/lib/ai/helpers/getTokenFromRegistry';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import { SUI_TYPE_ARG as SUI_TYPE_ARG_CONSTANT } from '@/constant';
import { executeTransaction } from '@/server/wallet';
import { useTransaction } from '@/hooks/use-transaction';
import { suiClient } from '@/lib/clients/sui-client';

const PARTNER_ADDRESS = "0xe43e24ca022903581290d7a47a8f3123b6e1b072bbdbbfd096b564625c5e1502";

type Token = {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    logo: string;
    price?: string;
}

type SwapState = {
    isLoading: boolean;
    isQuoteLoading: boolean;
    isTokenDetailsLoading: boolean;
    error: string | null;
    quote: QuoteResponse | null;
    fromToken: Token | null;
    toToken: Token | null;
};

export function useSwap(swapData: {
    fromTokenAddress?: string;
    toTokenAddress?: string;
    fromAmount?: string;
    walletAddress?: string;
    msgToolId: string;
}) {
    const { transaction, isLoading: isTransactionLoading, createTransaction, updateTransaction } = useTransaction(swapData.msgToolId, "SWAP");
    const [state, setState] = useState<SwapState>({
        isLoading: false,
        isQuoteLoading: false,
        isTokenDetailsLoading: false,
        error: null,
        quote: null,
        fromToken: null,
        toToken: null
    });
    const [digest, setDigest] = useState<string>();

    const updateState = (newState: Partial<SwapState>) => {
        setState(prev => ({ ...prev, ...newState }));
    };

    const fetchTokenDetails = async () => {
        if (!swapData.fromTokenAddress || !swapData.toTokenAddress) {
            updateState({ error: 'Invalid token addresses' });
            return;
        }

        try {
            updateState({ isTokenDetailsLoading: true, error: null });

            let fromToken: Token | null = null;
            let toToken: Token | null = null;

            // Try registry first
            const fromTokenData = await getTokenFromRegistry(swapData.fromTokenAddress);
            const toTokenData = await getTokenFromRegistry(swapData.toTokenAddress);

            const _fromTokenAddress = swapData.fromTokenAddress === SUI_TYPE_ARG ? SUI_TYPE_ARG_CONSTANT : swapData.fromTokenAddress;
            const _toTokenAddress = swapData.toTokenAddress === SUI_TYPE_ARG ? SUI_TYPE_ARG_CONSTANT : swapData.toTokenAddress;
            const prices = await getTokenPrices([_fromTokenAddress, _toTokenAddress]);

            // Handle fromToken
            if (fromTokenData) {
                fromToken = {
                    name: fromTokenData.name,
                    address: fromTokenData.address,
                    symbol: fromTokenData.symbol,
                    decimals: fromTokenData.decimals,
                    logo: fromTokenData.thumbnail,
                };
            } else {
                const fromDetails = await getCoinDetail({ coinType: swapData.fromTokenAddress });
                if (!fromDetails?.data?.data) throw new Error('Failed to fetch from token details');
                fromToken = {
                    name: fromDetails.data.data.name,
                    address: fromDetails.data.data.coinType,
                    symbol: fromDetails.data.data.symbol,
                    decimals: fromDetails.data.data.decimals,
                    logo: fromDetails.data.data.logo,
                    price: fromDetails.data.data.price,
                };
            }

            // Handle toToken
            if (toTokenData) {
                toToken = {
                    name: toTokenData.name,
                    address: toTokenData.address,
                    symbol: toTokenData.symbol,
                    decimals: toTokenData.decimals,
                    logo: toTokenData.thumbnail,
                };
            } else {
                const toDetails = await getCoinDetail({ coinType: swapData.toTokenAddress });
                if (!toDetails?.data?.data) throw new Error('Failed to fetch to token details');
                toToken = {
                    name: toDetails.data.data.name,
                    address: toDetails.data.data.coinType,
                    symbol: toDetails.data.data.symbol,
                    decimals: toDetails.data.data.decimals,
                    logo: toDetails.data.data.logo,
                    price: toDetails.data.data.price,
                };
            }

            if (!fromToken.price && prices[_fromTokenAddress]) {
                fromToken.price = prices[_fromTokenAddress].toString();
            }

            if (!toToken.price && prices[_toTokenAddress]) {
                toToken.price = prices[_toTokenAddress].toString();
            }

            updateState({ fromToken, toToken });
        } catch (err) {
            updateState({ error: 'Failed to fetch token details' });
        } finally {
            updateState({ isTokenDetailsLoading: false });
        }
    };

    const fetchQuote = async (retry = false) => {
        const { fromToken, toToken } = state;
        if (!fromToken || !toToken || !swapData.fromAmount) {
            updateState({ error: 'Missing required token information' });
            return;
        }

        try {
            updateState({ isQuoteLoading: true, error: null });
            const decimals = fromToken.decimals ?? 9;
            const adjustedAmount = toSmall(swapData.fromAmount.toString(), decimals);

            const adjustedSwapParams: SwapQuote = {
                tokenIn: fromToken.address,
                tokenOut: toToken.address,
                amountIn: adjustedAmount,
            };

            const quoteResponse = await getQuote(adjustedSwapParams);
            updateState({ quote: quoteResponse });
        } catch (err) {
            updateState({ error: 'Failed to fetch quote' });
            if (!retry) {
                setTimeout(() => fetchQuote(true), 2000);
            }
        } finally {
            updateState({ isQuoteLoading: false });
        }
    };

    const handleSwap = async () => {
        if (!swapData.walletAddress) {
            updateState({ error: 'Please connect your wallet first' });
            return;
        }

        if (!state.quote || !state.fromToken || !state.toToken) {
            updateState({ error: 'Quote not available' });
            return;
        }

        try {
            updateState({ isLoading: true, error: null });

            // Create transaction record
            await createTransaction({
                type: "SWAP",
                title: `Swapping ${swapData.fromAmount} ${state.fromToken.symbol} for ${state.quote.returnAmount} ${state.toToken.symbol}`,
                metadata: {
                    fromAmount: swapData.fromAmount,
                    fromToken: state.fromToken.address,
                    fromSymbol: state.fromToken.symbol,
                    toAmount: state.quote.returnAmount,
                    toToken: state.toToken.address,
                    toSymbol: state.toToken.symbol,
                }
            });

            const result = await buildTx({
                quoteResponse: state.quote,
                accountAddress: swapData.walletAddress,
                slippage: 0.01,
                commission: {
                    partner: PARTNER_ADDRESS,
                    commissionBps: 0,
                },
            });

            if (!result?.tx) {
                throw new Error('Failed to build transaction');
            }

            const txJson = await result.tx.toJSON();
            const txResult = await executeTransaction(txJson);
            
            if (!txResult || (txResult.errors && txResult.errors.length > 0)) {
                throw new Error('Failed to execute swap transaction');
            }

            setDigest(txResult.digest);
            return txResult;
        } catch (err: any) {
            await updateTransaction({
                status: "FAILED"
            });
            updateState({ error: err.message || 'Swap failed' });
            return null;
        }
    };

    useEffect(() => {
        fetchTokenDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [swapData.fromTokenAddress, swapData.toTokenAddress]);

    useEffect(() => {
        if (state.fromToken && state.toToken && !state.isTokenDetailsLoading) {
            fetchQuote();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.fromToken, state.toToken, state.isTokenDetailsLoading]);

    useEffect(() => {
        const fetchReceipt = async () => {
            if (digest) {
                await updateTransaction({
                    hash: digest,
                    status: "SUBMITTED"
                });
                const receipt = await suiClient.waitForTransaction({ digest: digest });
                if (receipt?.errors && receipt?.errors.length > 0) {
                    await updateTransaction({
                        status: "FAILED"
                    });
                } else {
                    await updateTransaction({
                        status: "SUCCESS"
                    });
                }
                updateState({ isLoading: false });
            }
        }
        fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [digest]);

    return {
        ...state,
        refreshQuote: fetchQuote,
        handleSwap,
        transaction,
        isTransactionLoading,
    };
} 