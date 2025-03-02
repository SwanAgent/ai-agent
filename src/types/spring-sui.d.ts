import { ParsedObligation, SuilendClient } from "@suilend/sdk";
import { ObligationOwnerCap } from "@suilend/sdk/_generated/suilend/lending-market/structs";

import { LstClient, LstId } from "@suilend/springsui-sdk";
import BigNumber from "bignumber.js";
import { CoinMetadata } from "@mysten/sui/client";

export type Token = CoinMetadata & {
    coinType: string;
};

export interface LstData {
    totalSuiSupply: BigNumber;
    totalLstSupply: BigNumber;
    suiToLstExchangeRate: BigNumber;
    lstToSuiExchangeRate: BigNumber;

    mintFeePercent: BigNumber;
    redeemFeePercent: BigNumber;
    spreadFeePercent: BigNumber;
    aprPercent?: BigNumber;

    fees: BigNumber;
    accruedSpreadFees: BigNumber;

    token: Token;
    price: BigNumber;

    suilendReserveStats:
    | {
        aprPercent: BigNumber;
        tvlUsd: BigNumber;
        sendPointsPerDay: BigNumber;
    }
    | undefined;
}

export type SpringSuiData = {
    suilendClient: SuilendClient;
    obligationOwnerCaps: ObligationOwnerCap<string>[] | undefined;
    obligations: ParsedObligation[] | undefined;

    sendPointsToken: Token;
    suiToken: Token;
    suiPrice: BigNumber;

    lstClientMap: Record<LstId, LstClient>;
    lstDataMap: Record<LstId, LstData>;

    currentEpoch: number;
    currentEpochProgressPercent: number;
    currentEpochEndMs: number;
}