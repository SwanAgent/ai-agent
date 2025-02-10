import { getQuote, buildTx, QuoteResponse } from "@7kprotocol/sdk-ts";
import { SwapQuote } from '@/types/actions';
import { toSmall } from '@/utils/token-converter';
import { getCoinDetail } from '@/server/actions/block-vision';
import { getTokenFromRegistry } from '@/lib/ai/helpers/getTokenFromRegistry';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';
import { SUI_TYPE_ARG as SUI_TYPE_ARG_CONSTANT } from '@/constant';
import { executeTransaction } from '@/server/wallet';
import { suiClient } from '@/lib/clients/sui-client';
import { getTokenPrices } from "@7kprotocol/sdk-ts";

const PARTNER_ADDRESS = "0xe43e24ca022903581290d7a47a8f3123b6e1b072bbdbbfd096b564625c5e1502";

export type Token = {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    logo: string;
    price?: string;
}

export type SwapResult = {
    success: boolean;
    error?: string;
    digest?: string;
    quote?: QuoteResponse;
    fromToken?: Token;
    toToken?: Token;
}

export async function fetchTokenDetails(fromTokenAddress: string, toTokenAddress: string): Promise<{ fromToken: Token, toToken: Token } | null> {
    try {
        let fromToken: Token | null = null;
        let toToken: Token | null = null;

        const fromTokenData = await getTokenFromRegistry(fromTokenAddress);
        const toTokenData = await getTokenFromRegistry(toTokenAddress);

        const _fromTokenAddress = fromTokenAddress === SUI_TYPE_ARG ? SUI_TYPE_ARG_CONSTANT : fromTokenAddress;
        const _toTokenAddress = toTokenAddress === SUI_TYPE_ARG ? SUI_TYPE_ARG_CONSTANT : toTokenAddress;
        const prices = await getTokenPrices([_fromTokenAddress, _toTokenAddress]);

        if (fromTokenData) {
            fromToken = {
                name: fromTokenData.name,
                address: fromTokenData.address,
                symbol: fromTokenData.symbol,
                decimals: fromTokenData.decimals,
                logo: fromTokenData.thumbnail,
            };
        } else {
            const fromDetails = await getCoinDetail({ coinType: fromTokenAddress });
            if (!fromDetails?.data?.data) throw new Error('Failed to fetch from token details');
            fromToken = {
                name: fromDetails.data.data.name,
                address: fromDetails.data.data.coinType,
                symbol: fromDetails.data.data.symbol,
                decimals: fromDetails.data.data.decimals,
                logo: fromDetails.data.data.logo,
                price: fromDetails.data.data.price,
            };
        }
        if (toTokenData) {
            toToken = {
                name: toTokenData.name,
                address: toTokenData.address,
                symbol: toTokenData.symbol,
                decimals: toTokenData.decimals,
                logo: toTokenData.thumbnail,
            };
        } else {
            const toDetails = await getCoinDetail({ coinType: toTokenAddress });
            if (!toDetails?.data?.data) throw new Error('Failed to fetch to token details');
            toToken = {
                name: toDetails.data.data.name,
                address: toDetails.data.data.coinType,
                symbol: toDetails.data.data.symbol,
                decimals: toDetails.data.data.decimals,
                logo: toDetails.data.data.logo,
                price: toDetails.data.data.price,
            };
        }

        if (!fromToken.price && prices[_fromTokenAddress]) {
            fromToken.price = prices[_fromTokenAddress].toString();
        }

        if (!toToken.price && prices[_toTokenAddress]) {
            toToken.price = prices[_toTokenAddress].toString();
        }

        return { fromToken, toToken };
    } catch (err) {
        console.error('Failed to fetch token details:', err);
        return null;
    }
}

export async function fetchQuote(fromToken: Token, toToken: Token, fromAmount: string): Promise<QuoteResponse | null> {
    try {
        const decimals = fromToken.decimals ?? 9;
        const adjustedAmount = toSmall(fromAmount.toString(), decimals);

        const adjustedSwapParams: SwapQuote = {
            tokenIn: fromToken.address,
            tokenOut: toToken.address,
            amountIn: adjustedAmount,
        };

        return await getQuote(adjustedSwapParams);
    } catch (err) {
        console.error('Failed to fetch quote:', err);
        return null;
    }
}

export async function executeSwap(
    quote: QuoteResponse,
    walletAddress: string,
    fromToken: Token,
    toToken: Token,
    fromAmount: string | number,
): Promise<SwapResult> {
    try {
        const result = await buildTx({
            quoteResponse: quote,
            accountAddress: walletAddress,
            slippage: 0.01,
            commission: {
                partner: PARTNER_ADDRESS,
                commissionBps: 0,
            },
        });

        if (!result?.tx) {
            throw new Error('Failed to build transaction');
        }

        const txJson = await result.tx.toJSON();
        const txResult = await executeTransaction(txJson);
        console.log('txResult', txResult);
        if (!txResult || (txResult.errors && txResult.errors.length > 0)) {
            throw new Error('Failed to execute swap transaction');
        }

        const receipt = await suiClient.waitForTransaction({ digest: txResult.digest });
        if (receipt?.errors && receipt?.errors.length > 0) {
            throw new Error('Transaction failed');
        }

        console.log('receipt', receipt);

        return {
            success: true,
            digest: txResult.digest,
            quote,
            fromToken,
            toToken
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Swap failed'
        };
    }
} 