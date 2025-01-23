"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionComponentProps } from '@/types/actions';
import { SwapTokenResponse } from '@/lib/ai/actions/swapToken';
import { useUser } from '@/hooks/use-user';
import { SwapSkeleton } from '../skeleton/swap';
import { useSwap } from '@/hooks/use-swap';
import { TransactionStatus } from '../transaction-status';

type SwapProps = ActionComponentProps<SwapTokenResponse>

export function SwapToken({ result: actionResult, msgToolId }: SwapProps) {
    const { toolResult: result, isLoading: isPageLoading, className } = actionResult;
    const { user, isLoading: isUserLoading } = useUser();
    const embeddedWallet = user?.wallets[0].publicKey;

    const {
        isLoading,
        isQuoteLoading,
        isTokenDetailsLoading,
        error,
        quote,
        fromToken,
        toToken,
        refreshQuote,
        handleSwap,
        transaction,
        isTransactionLoading
    } = useSwap({
        fromTokenAddress: result?.data?.fromTokenAddress,
        toTokenAddress: result?.data?.toTokenAddress,
        fromAmount: result?.data?.fromAmount?.toString(),
        walletAddress: embeddedWallet,
        msgToolId,
    });

    const isInitializing = isTokenDetailsLoading || isPageLoading || isUserLoading;
    const isActionDisabled = isLoading || isQuoteLoading || isInitializing || !quote;

    if (isInitializing) {
        return <SwapSkeleton />;
    }

    if (transaction) {
        return <TransactionStatus
            transaction={transaction}
            isLoading={isTransactionLoading}
        />;
    }

    return (
        <Card className='mt-3 overflow-hidden min-w-[384px]'>
            <CardHeader className="border-b w-full">
                <CardTitle className="flex items-center justify-between">
                    <span>Swap</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refreshQuote()}
                        disabled={isActionDisabled}
                    >
                        <RefreshCw className={cn(
                            "h-4 w-4",
                            (isQuoteLoading || isInitializing) && "animate-spin"
                        )} />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    {isInitializing ? (
                        <SwapSkeleton />
                    ) : error ? (
                        <div className="text-center text-red-500">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* From Token */}
                            <div className="flex flex-col gap-4">
                                <span className="text-xs text-muted-foreground">You Pay</span>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                        {fromToken?.logo && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={fromToken.logo}
                                                alt={fromToken.symbol || "token"}
                                                className="w-full h-full"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">
                                            {result?.data?.fromAmount} {fromToken?.symbol ?? result?.data?.fromTokenAddress}
                                        </span>
                                        {fromToken && (
                                            <span className="text-xs text-muted-foreground">
                                                ≈ ${(Number(result?.data?.fromAmount) * Number(fromToken?.price)).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex w-full justify-center my-3">
                                    <ArrowDown className="w-5 h-5 text-muted-foreground" />
                                </div>

                                {/* To Token */}
                                <span className="text-xs text-muted-foreground">You Receive</span>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                        {toToken?.logo && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={toToken.logo}
                                                alt={toToken.symbol || "token"}
                                                className="w-full h-full"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {isQuoteLoading ? (
                                            <span className="text-sm animate-pulse">Fetching quote...</span>
                                        ) : (
                                            <>
                                                <span className="font-medium">
                                                    {quote?.returnAmount} {toToken?.symbol ?? result?.data?.toTokenAddress}
                                                </span>
                                                {toToken && quote?.returnAmount && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ≈ ${(Number(quote.returnAmount) * Number(toToken.price)).toFixed(2)}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Swap Button */}
                            <Button
                                onClick={handleSwap}
                                disabled={isActionDisabled}
                                className={cn(
                                    "w-full",
                                    (isLoading || isQuoteLoading) && "animate-pulse"
                                )}
                            >
                                {isLoading ? 'Processing Swap...' :
                                    isQuoteLoading ? 'Fetching Quote...' :
                                        isTokenDetailsLoading ? 'Loading Token Details...' :
                                            !embeddedWallet ? 'Connect Wallet' :
                                                !quote ? 'Quote Unavailable' :
                                                    `Swap`}
                            </Button>

                            {/* Powered by text */}
                            <div className="flex justify-center">
                                <a
                                    href="https://port.7k.ag"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-muted-foreground/80"
                                >
                                    Powered by 7K Aggregator
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}