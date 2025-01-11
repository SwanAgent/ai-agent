import { SearchTokenDetailsResult } from "@/lib/ai/actions/searchTokenDetails";
import { Skeleton } from "../ui/skeleton";
import { CopyIcon } from "../icons";
import { ActionComponentProps } from "@/types/actions";

export type TokenDetailsCardProps = ActionComponentProps<SearchTokenDetailsResult>

export function TokenDetailsCard({ result, isLoading }: TokenDetailsCardProps) {
    if (isLoading) {
        return <div>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    }
    const { data: tokenDetails, error } = result ?? {};

    if (error) {
        return null
    }

    console.log("tokenDetails", tokenDetails);
    return <div>
        <div className="flex flex-col justify-between p-6 bg-card rounded-lg mb-4 shadow-sm border border-border/5 gap-6">
            <div className="flex justify-between">
            <div className="flex gap-4">
                <img 
                    src={tokenDetails?.imageUrl || '/fallback-token.png'} 
                    alt={tokenDetails?.name} 
                    className="w-16 h-16 rounded-full ring-1 ring-border/10"
                />
                <div className="flex flex-col justify-center gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold">{tokenDetails?.name}</h2>
                        <span className="text-sm font-medium text-muted-foreground">{tokenDetails?.symbol}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">{tokenDetails?.address.slice(0,6)}...{tokenDetails?.address.slice(-4)}<span className="text-xs text-muted-foreground font-mono"><CopyIcon/></span></span>
                        <div className="flex flex-wrap gap-1">
                            {tokenDetails?.labels?.map((label, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{label}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-row md:flex-col justify-between md:justify-center items-start md:items-end">
                    <div className="text-2xl font-bold">
                        ${tokenDetails?.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                    <div className="flex items-center gap-2">
                        {tokenDetails?.priceChange?.h24 !== undefined && (
                            <span className={`text-sm font-medium ${tokenDetails.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tokenDetails.priceChange.h24 >= 0 ? '↑' : '↓'} {Math.abs(tokenDetails.priceChange.h24).toFixed(2)}%
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">24h</span>
                    </div>
                </div>
            </div>
            </div>
            <div className="w-full grid grid-cols-3 md:flex gap-4 md:gap-6 items-start md:items-center justify-between md:border-l border-border/10 md:pl-6">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Market Cap</span>
                        <span className="font-medium">${tokenDetails?.marketCap?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">24h Volume</span>
                        <span className="font-medium">${tokenDetails?.volume?.h24?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Liquidity</span>
                        <span className="font-medium">${tokenDetails?.liquidityUsd?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
        </div>
        <div id="dexscreener-embed"><iframe src={`https://dexscreener.com/base/${tokenDetails?.pairAddress}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTimeframesToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`}></iframe></div>
    </div>
}