import { PortfolioResponse, CoinDetailResponse } from "@/types/block-vision";

export class BlockVision {
    private readonly baseUrl = 'https://api.blockvision.org/v2/sui';
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetch<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'x-api-key': this.apiKey,
            },
        });
        return response.json();
    }

    async getWalletCoins(walletAddress: string) {
        return this.fetch<PortfolioResponse>(`/account/coins?account=${walletAddress}`);
    }

    async getCoinDetail(coinType: string) {
        const encodedCoinType = encodeURIComponent(coinType);
        return this.fetch<CoinDetailResponse>(`/coin/detail?coinType=${encodedCoinType}`);
    }
}

export const blockVisionClient = new BlockVision('2rUlPakWPyX1ohsVkP3m01DsEW2');
