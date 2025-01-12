'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@suiet/wallet-kit';
import { getQuote, buildTx, estimateGasFee, QuoteResponse,  } from "@7kprotocol/sdk-ts";
import { SwapQuote, SwapCommission } from '@/types/actions';

const PARTNER_ADDRESS = "0xe43e24ca022903581290d7a47a8f3123b6e1b072bbdbbfd096b564625c5e1502"; // Replace with your partner address

export function Swap() {
  const { account } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);

  const swapParams: SwapQuote = {
    tokenIn: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    tokenOut: "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN",
    amountIn: "4000000000", // 1 SUI
  };

  const fetchQuote = async () => {
    try {
      setIsLoading(true);
      const quoteResponse: QuoteResponse = await getQuote(swapParams);
      console.log("quoteResponse", quoteResponse);
      setQuote(quoteResponse);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch quote');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleSwap = async () => {
    if (!account?.address) {
      setError("Wallet not connected");
      return;
    }

    try {
      setIsLoading(true);
      const result = await buildTx({
        quoteResponse: quote,
        accountAddress: account.address,
        slippage: 0.01,
        commission: {
          partner: PARTNER_ADDRESS,
          commissionBps: 0,
        },
      });

      if (!result?.tx) {
        throw new Error("Failed to build transaction");
      }

      console.log("Transaction built successfully:", result);
    } catch (err: any) {
      setError(err.message || 'Swap failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('mt-3 overflow-hidden w-full')}>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <span>Swap</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchQuote}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="font-medium">1 SUI</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="font-medium">{quote?.returnAmount}</span>
            </div>
          </div>


          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}

          <Button 
            onClick={handleSwap} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Swapping...' : 'Swap Tokens'}
          </Button>

          <a 
            href="https://port.7k.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground text-center hover:text-muted-foreground/80"
          >
            Powered by 7K Aggregator
          </a>
        </div>
      </CardContent>
    </Card>
  );
}