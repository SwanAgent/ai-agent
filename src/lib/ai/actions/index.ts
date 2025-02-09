import { getPortfolio } from './getPortfolio';
import { transfer } from './transfer';
import { swapTokens } from './swapToken';
import { getTrendingTokens } from './trendingTokens';
import { getTopGainers } from './topGainers';
import { fetchTweets, postTweet } from './twitter';
import { searchTokenDetails } from './searchTokenDetails';
import { getSuiAiPools } from './suiAi';
import { stakeToken } from './stakeToken';
import { z } from 'zod';

export interface ToolConfig {
    description: string;
    parameters: z.ZodType<any>;
    execute: <T>(
      params: z.infer<T extends z.ZodType ? T : never>,
    ) => Promise<any>;
    requiresConfirmation?: boolean;
}

export const tools = {
    getPortfolio,
    transfer,
    swapTokens,
    getTrendingTokens,
    getTopGainers,
    fetchTweets,
    postTweet,
    searchTokenDetails,
    getSuiAiPools,
    stakeToken,
};

