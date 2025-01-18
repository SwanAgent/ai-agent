'use client';

import { formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import { GetSuiAiTopPoolsResponse } from '@/lib/ai/actions/suiAi';
import { ActionComponentProps } from '@/types/actions';
import { SuiAiPools as SuiAiPoolsType } from '@/types/suiai';

type SuiAiPoolsProps = ActionComponentProps<GetSuiAiTopPoolsResponse>;

interface PoolCardProps {
  pool: SuiAiPoolsType;
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
    <a
      href={pool.website}
      target="_blank"
      rel="noopener noreferrer"
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
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pool.icon_url || `https://avatar.vercel.sh/${pool.name}??text=${pool.name[0].toUpperCase()}`}
            alt={pool.name}
            className="h-10 w-10 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{pool.name}</h3>
            <span className="text-xs text-muted-foreground">({pool.symbol})</span>
          </div>
          <div
            className={cn(
              'mt-1 text-xs font-medium'
            )}
          >
            {formatNumber(pool.price, 'currency')}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-px bg-border/50">
        <div className="bg-background/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground">
            Market Cap
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {formatNumber(pool.marketcap, 'currency')}
          </p>
        </div>
        <div className="bg-background/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground">
            24h Volume
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {formatNumber(pool.volume_24h, 'currency')}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{formatNumber(pool.holders, 'number')} holders</span>
          <span className="h-3 w-px bg-border/50" />
          {/* <span>TVL ${formatNumber(pool.tvl_usd, 'number')}</span> */}
        </div>
        <div className="flex items-center gap-2">
          {pool.is_partner && (
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-500">
              Partner
            </span>
          )}
          {pool.verified_type && (
            <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-green-500">
              Verified
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export function SuiAiPools({
  result,
}: SuiAiPoolsProps) {
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
        <PoolCard key={pool.pool_id} pool={pool} />
      ))}
    </div>
  );
}
