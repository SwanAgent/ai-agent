import { formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import { ActionComponentProps } from '@/types/actions';
import { GetLiquidityPoolsResponse, Pool } from '@/lib/ai/actions/getLiquidityPools';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

type LiquidityPoolsProps = ActionComponentProps<GetLiquidityPoolsResponse>;

interface PoolCardProps {
  pool: Pool;
  className?: string;
}

function PoolCardSkeleton() {
  return (
    <div className="group relative animate-pulse overflow-hidden rounded-xl bg-muted/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PoolCard({ pool, className }: PoolCardProps) {
  return (
    <div
      className={cn(
        'group relative block overflow-hidden rounded-xl bg-background/50',
        'border border-border/50',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-border/80 hover:bg-muted/20',
        'hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)]',
        'active:translate-y-0 active:shadow-none',
        className,
      )}
    >
      {/* Pool Info */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex gap-2">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pool.tokenA.info.logoURI || `https://avatar.vercel.sh/${pool.tokenA.info.name}?text=${pool.tokenA.info.name[0].toUpperCase()}`}
              alt={pool.tokenA.info.name}
              className="h-6 w-6 object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-lg">
            <img
              src={pool.tokenB.info.logoURI || `https://avatar.vercel.sh/${pool.tokenB.info.name}?text=${pool.tokenB.info.name[0].toUpperCase()}`}
              alt={pool.tokenB.info.name}
              className="h-6 w-6 object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{pool.symbol}</h3>
            {/* {pool.verified && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Verified
              </span>
            )} */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border/50">
        <div className="bg-background/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground">
            TVL
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {formatNumber(parseFloat(pool.tvl), 'currency')}
          </p>
        </div>
        <div className="bg-background/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground">
            24h Volume
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {formatNumber(parseFloat(pool.day.volume), 'currency')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="day" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">24h</TabsTrigger>
          <TabsTrigger value="week">7d</TabsTrigger>
          <TabsTrigger value="month">30d</TabsTrigger>
        </TabsList>
        <TabsContent value="day" className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">APR</p>
              <p className="text-sm font-medium">{parseFloat(pool.day.apr.total).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">Volume</p>
              <p className="text-sm font-medium">{formatNumber(parseFloat(pool.day.volume), 'currency')}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="week" className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">APR</p>
              <p className="text-sm font-medium">{parseFloat(pool.week.apr.total).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">Volume</p>
              <p className="text-sm font-medium">{formatNumber(parseFloat(pool.week.volume), 'currency')}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="month" className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">APR</p>
              <p className="text-sm font-medium">{parseFloat(pool.month.apr.total).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">Volume</p>
              <p className="text-sm font-medium">{formatNumber(parseFloat(pool.month.volume), 'currency')}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function LiquidityPools({
  result,
}: LiquidityPoolsProps) {
  const { toolResult, isLoading, className } = result;

  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-4',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          className,
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <PoolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { pools } = toolResult?.data ?? {};
  if (!pools?.length) return null;

  return (
    <div
      className={cn(
        'grid gap-4',
        pools.length === 1
          ? 'grid-cols-1'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {pools.map((pool) => (
        <PoolCard key={pool.address} pool={pool} />
      ))}
    </div>
  );
} 