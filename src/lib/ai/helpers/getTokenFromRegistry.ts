import { TokenMetadata } from "@/types/assets";

export type SearchTokenDetailsParams = {
    query: string;
};

export type SearchTokenDetailsResult = TokenMetadata | undefined;

export type CoinGeckoToken = {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
}

export const getTokenFromRegistry = async (query: string) => {
    const response = await fetch(`https://tokens.coingecko.com/near-protocol/all.json`, { next: { tags: ['coingecko-tokens'], revalidate: 60 * 60 }});
    const data = await response.json();
    const token: CoinGeckoToken | undefined = data.tokens.find((token: CoinGeckoToken) => token.name.toLowerCase() === query.toLowerCase() || token.symbol.toLowerCase() === query.toLowerCase() || token.address.toLowerCase() === query.toLowerCase());
    if (token) {
        return {
            blockchain: 'sui',
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            thumbnail: token.logoURI,
        };
    }
    return undefined;
}