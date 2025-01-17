import { SearchTokenDetailsResult } from "@/lib/ai/actions/searchTokenDetails";
import { Skeleton } from "../ui/skeleton";
import { CopyIcon } from "../icons";
import { ActionComponentProps } from "@/types/actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { GlobeIcon, InfoIcon } from "../icons";
import { ChartLine, ChartBar, ChartPie, XLogo, TelegramLogo, DiscordLogo, Link } from '@phosphor-icons/react'
import { useState } from "react";
import { formatTimeSince } from "@/lib/utils";

export type TokenDetailsCardProps = ActionComponentProps<SearchTokenDetailsResult>

export function TokenDetailsCard({ result }: TokenDetailsCardProps) {
    const { isLoading, toolResult } = result ?? {};
    const [selectedTimeframe, setSelectedTimeframe] = useState('h24');

    if (isLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[100px] w-full rounded-lg" />
        </div>
    }

    const { data: tokenDetails, error } = toolResult ?? {};
    if (error) return null;

    const timeframes = [
        { label: '5M', value: 'm5' },
        { label: '1H', value: 'h1' },
        { label: '6H', value: 'h6' },
        { label: '24H', value: 'h24' },
    ] as const;

    return (
        <div className="bg-card rounded-xl border border-border/10 overflow-hidden ">
            <Tabs defaultValue="info" className="min-w-[600px] p-4">
                {/* Header with Info/Chart Tabs */}
                <div className="border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={tokenDetails?.imageUrl || '/fallback-token.png'}
                                alt={tokenDetails?.name}
                                className="w-8 h-8 rounded-full"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-semibold">{tokenDetails?.name}</h2>
                                    <span className="text-sm text-muted-foreground">({tokenDetails?.symbol})</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {tokenDetails?.websiteUrl && (
                                    <a href={tokenDetails.websiteUrl} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-background/50 rounded-lg transition-colors text-muted-foreground">
                                        <GlobeIcon size={16} />
                                    </a>
                                )}
                                {tokenDetails?.twitterUrl && (
                                    <a href={tokenDetails.twitterUrl} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-background/50 rounded-lg transition-colors text-muted-foreground">
                                        <XLogo size={16} />
                                    </a>
                                )}
                                {tokenDetails?.telegramUrl && (
                                    <a href={tokenDetails.telegramUrl} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-background/50 rounded-lg transition-colors text-muted-foreground">
                                        <TelegramLogo size={16} />
                                    </a>
                                )}
                                {tokenDetails?.discordUrl && (
                                    <a href={tokenDetails.discordUrl} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-background/50 rounded-lg transition-colors text-muted-foreground">
                                        <DiscordLogo size={16} />
                                    </a>
                                )}
                            </div>
                            <TabsList className="grid grid-cols-2 h-8 w-32 bg-background/50">
                                <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
                                <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                </div>

                <TabsContent value="info" className="min-w-[600px]">
                    {/* Price Section */}
                    <div className="py-2 border-b border-border/10">
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-bold">
                                ${tokenDetails?.priceUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) ?? '0.00'}
                            </span>
                            <div className="flex items-center gap-2">
                                {tokenDetails?.priceChange?.h24 !== undefined && (
                                    <span className={`text-sm font-medium ${tokenDetails.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {tokenDetails.priceChange.h24 >= 0 ? '+' : ''}{tokenDetails.priceChange.h24.toFixed(2)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 border-b border-border/10">
                        {timeframes.map(({ label, value }) => (
                            <div key={value} className="p-3 text-center border-r last:border-r-0 border-border/10">
                                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                                <div className={`text-sm font-medium ${(tokenDetails?.priceChange?.[value] ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {(tokenDetails?.priceChange?.[value] ?? 0) >= 0 ? '+' : ''}{tokenDetails?.priceChange?.[value]?.toFixed(2) ?? '0.00'}%
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Volume and Transactions Tabs */}
                    {/* <div className="p-4 border-b border-border/10">
                        <Tabs defaultValue="vol" className="w-full">
                            <TabsList className="w-full grid grid-cols-2 h-9 p-1 bg-background/50 mb-4">
                                <TabsTrigger value="vol" className="text-xs">Volume</TabsTrigger>
                                <TabsTrigger value="txns" className="text-xs">Transactions</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="vol" className="mt-0">
                                <div className="grid grid-cols-6 gap-2">
                                    {timeframes.map(({ label, value }) => (
                                        <div key={value} className="text-center p-2">
                                            <div className="text-xs text-muted-foreground mb-1">{label}</div>
                                            <div className="font-medium text-sm">
                                                ${((tokenDetails?.volume?.[value] ?? 0) / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="txns" className="mt-0">
                                <div className="grid grid-cols-6 gap-2">
                                    {timeframes.map(({ label, value }) => (
                                        <div key={value} className="text-center p-2">
                                            <div className="text-xs text-muted-foreground mb-1">{label}</div>
                                            <div className="flex items-center justify-center gap-2 text-sm">
                                                <span className="text-green-500">{tokenDetails?.txns?.[value]?.buys || 0}</span>
                                                <span className="text-muted-foreground">/</span>
                                                <span className="text-red-500">{tokenDetails?.txns?.[value]?.sells || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div> */}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 w-full text-center border-b border-border/10 py-4">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">24H VOL</div>
                            <div className="font-medium">
                                ${(tokenDetails?.volume?.h24 ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}K
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">LIQUIDITY</div>
                            <div className="font-medium">
                                ${((tokenDetails?.liquidityUsd ?? 0) / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">TOTAL TXNS</div>
                            <div className="font-medium">
                                {tokenDetails?.txns?.h24?.buys ?? 0} <span className="text-green-500">buys</span> / {tokenDetails?.txns?.h24?.sells ?? 0} <span className="text-red-500">sells</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-3 text-center">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">AGE</div>
                            <div className="font-medium">{tokenDetails?.pairCreatedAt ? formatTimeSince(new Date(tokenDetails?.pairCreatedAt)) : '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">FDV</div>
                            <div className="font-medium">
                                ${((tokenDetails?.fdv ?? 0) / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">MARKET CAP</div>
                            <div className="font-medium">
                                ${((tokenDetails?.marketCap ?? 0) / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="chart" className="p-4 min-w-[600px]">
                    <div className="h-[500px] w-full">
                        <iframe
                            src={`https://dexscreener.com/sui/${tokenDetails?.pairAddress}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTimeframesToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`}
                            className="w-full h-full rounded-lg"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}