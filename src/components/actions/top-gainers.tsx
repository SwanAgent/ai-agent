import { formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import { ActionComponentProps } from '@/types/actions';
import { GetTopGainersResponse, TopGainerToken } from '@/lib/ai/actions/topGainers';

type TopGainersProps = ActionComponentProps<GetTopGainersResponse>;

interface TokenCardProps {
  token: TopGainerToken;
  className?: string;
}

function TokenCardSkeleton() {
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

function TokenCard({ token, className }: TokenCardProps) {
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
      {/* Token Info */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={token.coinMetadata.iconUrl || `https://avatar.vercel.sh/${token.coinMetadata.name}??text=${token.coinMetadata.name[0].toUpperCase()}`}
            alt={token.coinMetadata.name}
            className="h-10 w-10 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{token.coinMetadata.name}</h3>
            <span className="text-xs text-muted-foreground">({token.coinMetadata.symbol})</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-medium">
              {formatNumber(token.price, 'currency')}
            </span>
            <span className="text-xs font-medium text-green-500">
              +{token.priceChange4h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-px bg-border/50">
        <div className="bg-background/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground">
            Previous Price (4h)
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {formatNumber(token.price4hAgo, 'currency')}
          </p>
        </div>
        <div className="bg-background/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground">
            Current Price
          </p>
          <p className="mt-0.5 text-sm font-medium">
            {formatNumber(token.price, 'currency')}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Supply: {formatNumber(token.coinMetadata.supply, 'number')}</span>
          <span className="h-3 w-px bg-border/50" />
          <span>Pool: {token.pool.slice(0, 8)}...</span>
        </div>
      </div>
    </div>
  );
}

export function TopGainers({
  result,
}: TopGainersProps) {
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
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { tokens } = toolResult?.data ?? {};
  if (!tokens?.length) return null;

  return (
    <div
      className={cn(
        'grid gap-4',
        tokens.length === 1
          ? 'grid-cols-1'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {tokens.map((token) => (
        <TokenCard key={token.coinMetadata.coinType} token={token} />
      ))}
    </div>
  );
} 