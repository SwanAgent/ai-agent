export type PortfolioResponse = {
    code: number;
    message: string;
    result: {
        coins: Coin[];
        usdValue: string;
    };
}

export type Coin = {
    coinType: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    usdValue: string;
    price: string;
    priceChangePercentage24H: string;
    objects: number;
    scam: boolean;
    verified: boolean;
    logo: string;
};

export interface CoinDetailResponse {
    code: number;
    message: string;
    result: CoinDetail;
}

export interface CoinDetail {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    price: string;
    priceChangePercentage24H: string;
    totalSupply: string;
    holders: number;
    marketCap: string;
    packageID: string;
    coinType: string;
    objectType: string;
    website: string;
    creator: string;
    volume24H: string;
    createdTime: number;
    verified: boolean;
    circulating: string;
    scamFlag: number;
    birdeyeLink: string;
}