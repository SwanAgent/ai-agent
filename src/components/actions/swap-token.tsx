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
// import { useSwap } from '@/hooks/use-swap';
import { TransactionStatus } from '../transaction-status';
import { useTransaction } from '@/hooks/use-transaction';

type SwapProps = ActionComponentProps<SwapTokenResponse>

export function SwapToken({ result: actionResult, msgToolId }: SwapProps) {
    const { toolResult: result, isLoading: isPageLoading, className } = actionResult;
    const { user, isLoading: isUserLoading } = useUser();
    const embeddedWallet = user?.wallets[0].publicKey;

    // const {
    //     isLoading,
    //     isQuoteLoading,
    //     isTokenDetailsLoading,
    //     error,
    //     quote,
    //     fromToken,
    //     toToken,
    //     refreshQuote,
    //     handleSwap,
    //     transaction,
    //     isTransactionLoading
    // } = useSwap({
    //     fromTokenAddress: result?.data?.fromTokenAddress,
    //     toTokenAddress: result?.data?.toTokenAddress,
    //     fromAmount: result?.data?.fromAmount?.toString(),
    //     walletAddress: embeddedWallet,
    //     msgToolId,
    // });

    const { transaction, isLoading: isTransactionLoading } = useTransaction(
        msgToolId,
        'SWAP'
    );
    
    const isInitializing = isPageLoading || isUserLoading || isTransactionLoading;
    const isActionDisabled = isPageLoading || isUserLoading || !result?.data;

    if (isInitializing) {
        return <SwapSkeleton />;
    }

    if (transaction) {
        return <TransactionStatus
            transaction={transaction}
            isLoading={isTransactionLoading}
        />;
    }
}