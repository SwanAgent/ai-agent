import { ActionResponse } from "@/types/actions";
import { DexScreenerSearchResponse, TokenDetails } from "@/types/dex-screener";
import { z } from "zod";

export const searchTokenDetailsSchema = z.object({
    query: z.string().describe('The query to search for token details, it can be part of token name, symbol, or address'),
});

export type SearchTokenDetailsParams = z.infer<typeof searchTokenDetailsSchema>;
export type SearchTokenDetailsResult = ActionResponse<TokenDetails>;

type TokenMetadata = {
    name: string;
    symbol: string;
    address: string;
}

export const getTokenAddress = (query: string, baseToken: TokenMetadata, quoteToken: TokenMetadata) => {
    if (baseToken.name.toLowerCase() === query.toLowerCase() || baseToken.symbol.toLowerCase() === query.toLowerCase() || baseToken.address.toLowerCase() === query.toLowerCase()) {
        return baseToken.address;
    }
    if (quoteToken.name.toLowerCase() === query.toLowerCase() || quoteToken.symbol.toLowerCase() === query.toLowerCase() || quoteToken.address.toLowerCase() === query.toLowerCase()) {
        return quoteToken.address;
    }

    if (baseToken.name.toLowerCase().includes(query.toLowerCase()) || baseToken.symbol.toLowerCase().includes(query.toLowerCase())) {
        return baseToken.address;
    }

    if (quoteToken.name.toLowerCase().includes(query.toLowerCase()) || quoteToken.symbol.toLowerCase().includes(query.toLowerCase())) {
        return quoteToken.address;
    }
    return null;
}

export const exactTokenMatch = (query: string, token: TokenMetadata) => {
    return token.name.toLowerCase() === query.toLowerCase() || token.symbol.toLowerCase() === query.toLowerCase() || token.address.toLowerCase() === query.toLowerCase();
}

export const searchTokenDetails = {
    description: 'Search for token details using either token name, symbol, or address.',
    parameters: searchTokenDetailsSchema,
    execute: async ({ query }: SearchTokenDetailsParams): Promise<SearchTokenDetailsResult> => {
        try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${query}`);
            const data: DexScreenerSearchResponse = await response.json();
            const chainFilteredData = data.pairs.filter((pair) => pair.chainId === 'sui').sort((a, b) => {
                const exactMatchA = exactTokenMatch(query, a.baseToken) || exactTokenMatch(query, a.quoteToken);
                const exactMatchB = exactTokenMatch(query, b.baseToken) || exactTokenMatch(query, b.quoteToken);
                if (exactMatchA && exactMatchB) {
                    return 0;
                } else if (exactMatchA) {
                    return -1;
                } else if (exactMatchB) {
                    return 1;
                }
                return b.liquidity?.usd - a.liquidity?.usd;
            });

            if (chainFilteredData.length === 0) {
                return {
                    success: false,
                    error: `Could not find token details for ${query}. Please try a specific token name, symbol, or address.`,
                };
            }

            const tokenAddress = getTokenAddress(query, chainFilteredData[0].baseToken, chainFilteredData[0].quoteToken);

            if (!tokenAddress) {
                return {
                    success: false,
                    error: `Could not find token details for ${query}. Please try a specific token name, symbol, or address.`,
                };
            }

            const filteredData = chainFilteredData[0];
            const name = filteredData.baseToken.address.toLowerCase() === tokenAddress.toLowerCase() ? filteredData.baseToken.name : filteredData.quoteToken.name;
            const symbol = filteredData.baseToken.address.toLowerCase() === tokenAddress.toLowerCase() ? filteredData.baseToken.symbol : filteredData.quoteToken.symbol;

            const tokenDetails: TokenDetails = {
                address: tokenAddress,
                name: name,
                symbol: symbol,
                imageUrl: filteredData.info?.imageUrl || '',
                websiteUrl: filteredData.info?.websites?.[0]?.url || '',
                socials: filteredData.info?.socials || [],
                priceUsd: parseFloat(filteredData.priceUsd),
                liquidityUsd: filteredData.liquidity.usd,
                marketCapUsd: filteredData.marketCap,
                pairCreatedAt: filteredData.pairCreatedAt,
                labels: filteredData.labels,
                pairAddress: filteredData.pairAddress,
                txns: filteredData.txns,
                volume: filteredData.volume,
                priceChange: filteredData.priceChange,
                fdv: filteredData.fdv,
                marketCap: filteredData.marketCap,
            };

            return {
                success: true,
                suppressFollowUp: true,
                data: tokenDetails,
            };
        } catch (error) {
            console.log("error fetching token details", error);
            return {
                success: false,
                error: `Could not find token details for ${query}. Please try a specific token name, symbol, or address.`,
            };
        }
    },
};