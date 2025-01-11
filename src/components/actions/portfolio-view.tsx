'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types/assets';
import { Wallet, TrendingUp } from 'lucide-react';
import { ActionComponentProps } from '@/types/actions';
import { GetPortfolioResult } from '@/lib/ai/actions/getPortfolio';

type PortfolioViewProps = ActionComponentProps<GetPortfolioResult>

interface TokenRowProps {
  asset: AssetType;
  index: number;
}

const formatNumber = (value: string | number, style: 'currency' | 'decimal' = 'decimal') => {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-US', {
    style,
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

const TokenCardSkeleton = () => (
  <div className="flex items-center justify-between p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 w-20 rounded bg-muted" />
      <div className="h-3 w-12 rounded bg-muted" />
    </div>
  </div>
);

const TokenRow = ({ asset, index }: TokenRowProps) => (
  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.tokenName}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {asset.tokenSymbol.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium">{asset.tokenName}</p>
          <p className="text-sm text-muted-foreground">{asset.tokenSymbol}</p>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className="font-medium">{formatNumber(asset.balanceUsd, 'currency')}</p>
      <p className="text-sm text-muted-foreground">
        {formatNumber(asset.balance)} {asset.tokenSymbol}
      </p>
    </div>
  </div>
);

export function PortfolioView({ result, isLoading, className }: PortfolioViewProps) {
  if (isLoading) {
    return (
      <Card
        className={cn(
          'max-w-48 mt-3 overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/30',
          className,
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
            <div className="h-7 w-28 animate-pulse rounded-lg bg-muted" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[480px] overflow-y-scroll pr-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <TokenCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data, error } = result ?? {};

  if(error) {
    return <div>Error fetching portfolio</div>;
  }

  return (
    <Card
      className={cn(
        'mt-3 max-w-96 overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/30',
        className,
      )}
    >
      <CardHeader className="border-b border-border/40 bg-muted/20">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span>Portfolio</span>
            </div>
          </div>
          <span className="text-lg font-bold">
            {formatNumber(data?.totalBalanceUsd ?? 0, 'currency')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[480px] overflow-y-scroll pr-4">
          <div className="divide-y divide-border/40">
            {data?.assets.map((asset, index) => (
              <TokenRow key={index} asset={asset} index={index} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
