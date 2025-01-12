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