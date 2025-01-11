export type SearchTokenDetailsParams = {
    query: string;
};
export type SearchTokenDetailsResult = string | undefined;


export const getTokenFromRegistry = async (query: string) => {
    const response = await fetch(`https://tokens.coingecko.com/base/all.json`, { cache: 'no-store', next: { tags: ['coingecko-tokens'], revalidate: 60 * 60 }});
    const data = await response.json();
    const token = data.tokens.find((token: any) => token.name.toLowerCase() === query.toLowerCase() || token.symbol.toLowerCase() === query.toLowerCase() || token.address.toLowerCase() === query.toLowerCase());
    if (token) {
        return token;
    }
    return undefined;
}