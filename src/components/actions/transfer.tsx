'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionComponentProps } from '@/types/actions';
import { TransferResponse } from '@/lib/ai/actions/transfer';
import { Skeleton } from '../ui/skeleton';
import { useTransaction } from '@/hooks/use-transaction';
import { TransactionStatus } from '../transaction-status';
import { formatAddress } from '@mysten/sui/utils';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getTransferCoinTxb } from '@/utils/create-transfer-coin-txb';
import { toSmall } from '@/utils/token-converter';
import { suiClient } from '@/lib/clients/sui-client';

type TransferProps = ActionComponentProps<TransferResponse>


export function Transfer({ result: actionResult, msgToolId }: TransferProps) {
    const { toolResult: result, isLoading: isPageLoading, className } = actionResult;
    const { data, error: toolError } = result ?? {};

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [digest, setDigest] = useState<string>();

    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount();

    const { transaction, isLoading: isTransactionLoading, createTransaction, updateTransaction } = useTransaction(msgToolId, "TRANSFER");

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
                        title: "Transferred " + amount + " " + tokenToSend.symbol.toUpperCase(),
                        status: "SUCCESS"
                    });
                }
                setIsLoading(false);
            }
        }
        fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [digest]);

    if (isPageLoading || !currentAccount) {
        return <div className="flex flex-col">
            <Skeleton className="w-full h-56" />
        </div>;
    }

    if (!data || toolError) return <div>Error fetching transfer details</div>
    const { walletAddress, amount, tokenToSend } = data ?? {};

    const handleTransfer = async () => {
        try {
            setIsLoading(true);
            setError(null);

            await createTransaction({
                type: "TRANSFER",
                title: `Transferring ${amount} ${tokenToSend.symbol.toUpperCase()}`,
                metadata: {
                    amount,
                    tokenAddress: tokenToSend.address,
                    tokenSymbol: tokenToSend.symbol,
                    recipient: walletAddress,
                }
            })

            const amountToSend = toSmall(amount, tokenToSend.decimals);
            const tx = await getTransferCoinTxb(tokenToSend.address, BigInt(amountToSend), walletAddress, currentAccount.address)

            console.log("tx check", tx);
            signAndExecuteTransaction(
                {
                    transaction: tx
                },
                {
                    onSuccess: async (result) => {
                        setDigest(result.digest);
                        console.log("digest check", result.digest);
                    },
                    onError: (error) => {
                        console.error(error);
                        setError('Failed to process transfer');
                    }
                },
            );
        } catch (err: any) {
            setError(err.message || 'Failed to process transfer');
            // await updateTransaction({
            //   status: "FAILED",
            // });
            console.error(err);
        } 
    };

    if (transaction) {
        return <TransactionStatus
            transaction={transaction}
            isLoading={isTransactionLoading}
        />;
    }

    return (
        <Card className={cn('mt-3 overflow-hidden', className)}>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Transfer
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">From</span>
                            <span className="font-medium">{formatAddress(currentAccount.address)}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-muted-foreground">To</span>
                            <span className="font-medium">{formatAddress(data?.walletAddress ?? "")}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">Amount</span>
                        <span className="font-medium">
                            {amount} {tokenToSend.symbol.toUpperCase()}
                        </span>
                    </div>

                    {error && (
                        <div className="text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleTransfer}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Confirming...' : 'Confirm Transfer'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
