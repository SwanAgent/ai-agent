import { CoinObject } from '@/types/assets';
import { PaginatedCoins, SuiClient, CoinStruct } from '@mysten/sui/client';
import { suiClient } from '../clients/sui-client';

export class SuiProvider {
    private readonly suiClient: SuiClient;
    constructor(suiClient: SuiClient) {
        this.suiClient = suiClient;
    }

    public async getOwnedCoins(address: string): Promise<CoinObject[]> {
        const coins: CoinObject[] = [];
        let hasNextPage = true;
        let nextCursor = null;
        while (hasNextPage) {
            const resp: PaginatedCoins = await this.suiClient.getAllCoins({
                owner: address,
                cursor: nextCursor,
            });
            const data = resp.data as CoinStruct[];
            data.forEach((item) => {
                coins.push({
                    type: item.coinType,
                    objectId: item.coinObjectId,
                    symbol: '',
                    balance: BigInt(item.balance),
                    lockedUntilEpoch: null,
                    previousTransaction: item.previousTransaction,
                    object: item,
                });
            });
            hasNextPage = resp.hasNextPage;
            nextCursor = resp.nextCursor;
        }
        return coins;
    }

    public async getOwnedCoin(
        address: string,
        coinType: string,
        filterOptions?: {
            amount?: bigint;
        }
    ): Promise<CoinObject[]> {
        const coins: CoinObject[] = [];
        let hasNextPage = true;
        let nextCursor = null;

        // NOTE: potential performance issue if there are too many coins
        // only fetch coins until the amount is enough
        let currentAmount = BigInt(0);
        // solution: add an amount parameter to determine how many coin objects should be fetch
        while (hasNextPage) {
            const resp: any = await this.suiClient.getCoins({
                owner: address,
                coinType,
                cursor: nextCursor,
            });

            resp.data.forEach((item: CoinStruct) => {
                const coinBalance = BigInt(item.balance);
                coins.push({
                    type: item.coinType,
                    objectId: item.coinObjectId,
                    symbol: '',
                    balance: coinBalance,
                    lockedUntilEpoch: null,
                    previousTransaction: item.previousTransaction,
                    object: item,
                });
                currentAmount += coinBalance;
            });

            if (
                typeof filterOptions?.amount === 'bigint' &&
                currentAmount >= filterOptions.amount
            ) {
                break;
            }

            hasNextPage = resp.hasNextPage;
            nextCursor = resp.nextCursor;
        }
        return coins;
    }
}

export const suiProvider = new SuiProvider(suiClient);