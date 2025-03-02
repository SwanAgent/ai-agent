'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types/assets';
import { Wallet, TrendingUp } from 'lucide-react';

interface PortfolioViewProps {
  data: {
    totalBalanceUsd: string;
    totalCount: number;
    assets: AssetType[];
  };
  className?: string;
  isLoading?: boolean;
}

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