import { getPortfolio } from './getPortfolio';
import { transfer } from './transfer';
import { swapTokens } from './swapToken';
import { automatedSwapToken } from './automatedSwapToken';
import { getTrendingTokens } from './trendingTokens';
import { getTopGainers } from './topGainers';
import { fetchTweets, postTweet, fetchTweetsTillTimestamp } from './twitter';
import { searchTokenDetails } from './searchTokenDetails';
import { getSuiAiPools } from './suiAi';
import { stakeToken } from './stakeToken';
import { z } from 'zod';
import { createActionTool } from './action';
import { CoreTool, ToolExecutionOptions } from 'ai';
import { getLiquidityPools } from './getLiquidityPools';

export type ToolConfig = CoreTool & {
    execute: (args: any, options?: ToolExecutionOptions) => PromiseLike<any>, 
    displayName: string;
    description: string;
    requiresConfirmation?: boolean;
}

export const defaultToolsWithoutConfirmation: Record<string, ToolConfig> = {
  getPortfolio,
  swapTokens: automatedSwapToken,
  // fetchTweets,
  postTweet,
  // searchTokenDetails,
  // getSuiAiPools,
  // getLiquidityPools,
  fetchTweetsTillTimestamp,
  getTrendingTokens,
}


export const defaultTools: Record<string, ToolConfig> = {
  ...defaultToolsWithoutConfirmation,
  // swapTokens: swapTokens,
  // createActionTool,
  // transfer,
  //stakeToken
};

// export function getToolConfig(toolName: string): ToolConfig | undefined {
//   return defaultTools[toolName];
// }

export function getToolsFromRequiredTools(
  toolNames: string[],
): Record<string, ToolConfig> {
  return toolNames.reduce((acc: Record<string, ToolConfig>, toolName) => {
    const tool = defaultToolsWithoutConfirmation[toolName];
    if (tool) {
      acc[toolName] = tool;
    }
    return acc;
  }, {});
}
