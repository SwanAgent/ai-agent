import { ActionResponse } from "@/types/actions";
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
            console.log("data", query, data.pairs.length);
            const chainFilteredData = data.pairs.filter((pair) => pair.chainId === 'base').sort((a, b) => {
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
            const tokenDetails: TokenDetails = {
                address: tokenAddress,
                name: filteredData.baseToken.name,
                symbol: filteredData.baseToken.symbol,
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

export type TokenDetails = {
    address: string;
    name: string;
    symbol: string;
    imageUrl: string;
    websiteUrl: string;
    socials: {
        type: string;
        url: string;
    }[];
    priceUsd: number;
    liquidityUsd: number;
    marketCapUsd: number;
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    pairAddress: string;
    labels: string[];
    txns?: {
        m5?: {
            buys: number;
            sells: number;
        };
        h1?: {
            buys: number;
            sells: number;
        };
        h6?: {
            buys: number;
            sells: number;
        };
        h24?: {
            buys: number;
            sells: number;
        };
    };
    volume?: {
        h24?: number;
        h6?: number;
        h1?: number;
        m5?: number;
    };
    priceChange?: {
        m5?: number;
        h1?: number;
        h6?: number;
        h24?: number;
    };
}


export type DexScreenerSearchResponse = {
    schemaVersion: string;
    pairs: {
        chainId: string;
        dexId: string;
        url: string;
        pairAddress: string;
        labels: string[];
        baseToken: {
            address: string;
            name: string;
            symbol: string;
        };
        quoteToken: {
            address: string;
            name: string;
            symbol: string;
        };
        priceNative: string;
        priceUsd: string;
        txns?: {
            m5?: {
                buys: number;
                sells: number;
            };
            h1?: {
                buys: number;
                sells: number;
            };
            h6?: {
                buys: number;
                sells: number;
            };
            h24?: {
                buys: number;
                sells: number;
            };
        };
        volume?: {
            h24?: number;
            h6?: number;
            h1?: number;
            m5?: number;
        };
        priceChange?: {
            m5?: number;
            h1?: number;
            h6?: number;
            h24?: number;
        };
        liquidity: {
            usd: number;
            base: number;
            quote: number;
        };
        fdv: number;
        marketCap: number;
        pairCreatedAt: number;
        info: {
            imageUrl?: string;
            websites?: {
                label?: string;
                url: string;
            }[];
            socials?: {
                type: string;
                url: string;
            }[];
        };
        
        boosts?: {
            active: number;
        };
    }[];
}

// export const dexScreenerSearchResponseExample: DexScreenerSearchResponse = {
//     "schemaVersion": "text",
//     "pairs": [
//         {
//             "chainId": "solana",
//             "dexId": "raydium",
//             "url": "https://dexscreener.com/solana/3legaqekuktwbjtxhrg1l1spg7zzbsohvmctmbhffqtq",
//             "pairAddress": "3LEgaqekukTWbjTxHRg1L1spg7zZBSohvmctmbhfFQtq",
//             "baseToken": {
//                 "address": "BDW8YHasD3NSDjSHU9Xy6KXtshGayMGQfj5bJpLcpump",
//                 "name": "Hiero Terminal",
//                 "symbol": "HTERM"
//             },
//             "quoteToken": {
//                 "address": "So11111111111111111111111111111111111111112",
//                 "name": "Wrapped SOL",
//                 "symbol": "SOL"
//             },
//             "priceNative": "0.0001309",
//             "priceUsd": "0.02819",
//             "txns": {
//                 "m5": {
//                     "buys": 28,
//                     "sells": 15
//                 },
//                 "h1": {
//                     "buys": 467,
//                     "sells": 439
//                 },
//                 "h6": {
//                     "buys": 2986,
//                     "sells": 2507
//                 },
//                 "h24": {
//                     "buys": 18364,
//                     "sells": 15343
//                 }
//             },
//             "volume": {
//                 "h24": 24489817.82,
//                 "h6": 3974626.48,
//                 "h1": 828517.08,
//                 "m5": 42744.62
//             },
//             "priceChange": {
//                 "m5": 1.37,
//                 "h1": 9.06,
//                 "h6": 10.89,
//                 "h24": 48.43
//             },
//             "liquidity": {
//                 "usd": 883589.79,
//                 "base": 15688012,
//                 "quote": 2048.6806
//             },
//             "fdv": 22916799,
//             "marketCap": 22916799,
//             "pairCreatedAt": 1736100688000,
//             "info": {
//                 "imageUrl": "https://dd.dexscreener.com/ds-data/tokens/solana/BDW8YHasD3NSDjSHU9Xy6KXtshGayMGQfj5bJpLcpump.png?key=ab7cf9",
//                 "header": "https://dd.dexscreener.com/ds-data/tokens/solana/BDW8YHasD3NSDjSHU9Xy6KXtshGayMGQfj5bJpLcpump/header.png?key=ab7cf9",
//                 "openGraph": "https://cdn.dexscreener.com/token-images/og/solana/BDW8YHasD3NSDjSHU9Xy6KXtshGayMGQfj5bJpLcpump?timestamp=1736238000000",
//                 "websites": [
//                     {
//                         "label": "Website",
//                         "url": "https://hiero.ai"
//                     },
//                     {
//                         "label": "Docs",
//                         "url": "https://github.com/hiero-ai/docs"
//                     },
//                     {
//                         "label": "Streamflow Locked Team Supply",
//                         "url": "https://app.streamflow.finance/contract/solana/mainnet/8ZPftQnaAvBaN6agAJifQ4DBDdUbfdR8gcNnCH1MX3Ds"
//                     }
//                 ],
//                 "socials": [
//                     {
//                         "type": "twitter",
//                         "url": "https://x.com/HieroTerminal"
//                     },
//                     {
//                         "type": "telegram",
//                         "url": "https://t.me/hiero_ai"
//                     }
//                 ]
//             }
//         }
//     ]
// }