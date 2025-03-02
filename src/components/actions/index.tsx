import { ActionComponentProps } from "@/types/actions";
import { FetchTweets } from "./fetch-tweets";
import { TokenDetailsCard } from "./token-details";
import { PortfolioView } from "./portfolio-view";
import { Transfer } from "./transfer";
import { SuiAiPools } from "./sui-ai-pools";
// import { SwapToken } from "./swap-token";
import { ActionResult } from "./action";
import { TrendingTokens } from "./trending-tokens";
import { TopGainers } from "./top-gainers";
// import Stake from "../stake/stake";
import { LiquidityPools } from "./liquidity-pools";
import { SwapToken } from "./swap-token";

export { SwapToken } from "./swap-token";
// export { Transfer } from "./transfer";
export { TokenDetailsCard } from "./token-details";
export { PostTweet } from "./post-tweet";
export { PortfolioView } from "./portfolio-view";
// export { ResolveBasename } from "./resolve-basename";

export type ToolResultRenderer = (props: ActionComponentProps<any> & { msgToolId: string }) => React.ReactNode | null;

export function DefaultToolResultRenderer({ result }: { result: any }) {
  // console.log("result", result);
  if (result && typeof result === 'object' && 'error' in result) {
    return (
      <div className="mt-2 pl-3.5 text-sm text-destructive">
        {String((result as { error: unknown }).error)}
      </div>
    );
  }
  
  return (
    <div className="mt-2 border-l border-border/40 pl-3.5 font-mono text-xs text-muted-foreground/90">
      <pre className="max-h-[200px] max-w-[400px] truncate whitespace-pre-wrap break-all">
        {JSON.stringify(result, null, 2).trim()}
      </pre>
    </div>
  );
}

export const defaultTools: Record<string, {
  displayName: string;
  component: ToolResultRenderer;
}> = {
  "fetchTweets": {
    displayName: "Fetch Tweets",
    component: FetchTweets,
  },
  "swapToken": {
    displayName: "Swap Token",
    component: DefaultToolResultRenderer,
  },
  "tokenDetails": {
    displayName: "Token Details",
    component: DefaultToolResultRenderer,
  },
  "FetchTweets": {
    displayName: "Fetch Tweets",
    component: FetchTweets,
  },
  "postTweet": {
    displayName: "Post Tweet",
    component: DefaultToolResultRenderer,
  },
  "getPortfolio": {
    displayName: "getPortfolio",
    component: PortfolioView,
  },
  "searchTokenDetails": {
    displayName: "Search Token Details",
    component: TokenDetailsCard,
  },
  "transfer": {
    displayName: "Transfer Coins",
    component: Transfer,
  },
  "getSuiAiPools": {
    displayName: "Get Sui Ai Pools",
    component: SuiAiPools,
  },
  "swapTokens": {
    displayName: "Swap Tokens",
    component: SwapToken,
  },
  "createActionTool": {
    displayName: "Create Action",
    component: ActionResult,
  },
  "getTrendingTokens": {
    displayName: "Trending Tokens",
    component: TrendingTokens,
  },
  "getTopGainers": {
    displayName: "Top Gainers",
    component: TopGainers,
  },
  // "stakeToken": {
  //   displayName: "Stake Tokens",
  //   component: Stake,
  // },
  "getLiquidityPools": {
    displayName: "Get Liquidity Pools",
    component: LiquidityPools,
  },
  "fetchTweetsTillTimestamp": {
    displayName: "Fetch Tweets Till Timestamp",
    component: FetchTweets,
  },
  // "resolveBasename": DefaultToolResultRenderer,
}

export function getToolConfig(toolName: string): {
  displayName: string;
  component: ToolResultRenderer;
} | undefined {
  return defaultTools[toolName];
}