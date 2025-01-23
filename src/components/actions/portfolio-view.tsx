"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { ActionComponentProps } from "@/types/actions";
import { GetPortfolioResult } from "@/lib/ai/actions/getPortfolio";
import { Coin } from "@/types/block-vision";
import { fromSmall } from "@/utils/token-converter";

type PortfolioViewProps = ActionComponentProps<GetPortfolioResult>;

interface CoinRowProps {
  coin: Coin;
  index: number;
}

const formatNumber = (
  value: string | number,
  style: "currency" | "decimal" = "decimal"
) => {
  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-US", {
    style,
    currency: "USD",
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

const CoinRow = ({ coin, index }: CoinRowProps) => (
  <div className="flex items-center justify-between px-6 py-4 w-full hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        {coin.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coin.logo}
            alt={coin.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {coin.symbol.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium">{coin.name}</p>
          <p className="text-sm text-muted-foreground">
            {coin.symbol}
          </p>
        </div>
        {(Number(coin.priceChangePercentage24H) !== 0) && (
          <div className="ml-1">
            {Number(coin.priceChangePercentage24H) >= 0 ? (
              <div className="bg-green-500/10 px-2 rounded-md">
                <span className="text-green-500 text-xs leading-3 font-medium">
                  +
                  {Number(
                    coin.priceChangePercentage24H
                  ).toFixed(2)}
                  %
                </span>
              </div>
            ) : (
              <div className="bg-red-500/10 px-2 rounded-md">
                <span className="text-red-500 text-xs leading-3 font-medium">
                  {Number(
                    coin.priceChangePercentage24H
                  ).toFixed(2)}
                  %
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <div className="text-right">
      <p className="font-medium">
        {formatNumber(coin.usdValue, "currency")}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatNumber(
          fromSmall(coin.balance, coin.decimals),
          "decimal"
        )}{" "}
        {coin.symbol}
      </p>
    </div>
  </div>
);

export function PortfolioView({
  result,
}: PortfolioViewProps) {
  const { toolResult, isLoading, className } = result ?? {};
  if (isLoading) {
    return (
      <Card
        className={cn(
          "max-w-96 w-96 overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/30",
          className
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
            <div className="h-7 w-28 animate-pulse rounded-lg bg-muted" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[480px] overflow-y-scroll">
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

  const { data, error } = toolResult ?? {};

  if (error) {
    return <div>Error fetching portfolio</div>;
  }

  return (
    <Card
      className={cn(
        "max-w-96 w-96 overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/30",
        className
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
            {formatNumber(data?.usdValue ?? 0, "currency")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[480px] overflow-y-scroll">
          <div className="divide-y divide-border/40">
            {data?.coins.map((coin, index) => (
              <CoinRow key={index} coin={coin} index={index} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
