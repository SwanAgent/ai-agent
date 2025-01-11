import { ActionResponse } from "@/types/actions";
import { TokenMetadata } from "@/types/assets";
import { z } from "zod";
import { getTokenFromRegistry } from "../helpers/getTokenFromRegistry";

export const transferSchema = z.object({
    walletAddress: z.string(),
    amount: z.string(),
    tokenToSend: z.string().default('ETH').describe('The name/symbol/address of the token to transfer, for native token eth, just using ETH. If there is no token mentioned assume ETH. '),
});

export type TransferParams = z.infer<typeof transferSchema>;
export type TransferResponse = ActionResponse<{
    walletAddress: string;
    amount: string;
    tokenToSend: TokenMetadata;
}>;

export const transfer = {
    description: 'Transfer funds from one wallet to another. TokenAddress is the address of the token to transfer, for native token eth, just using ETH.',
    parameters: transferSchema,
    execute: async ({ walletAddress, amount, tokenToSend }: TransferParams): Promise<TransferResponse> => {
        try{
            let tokenDetails = {
            blockchain: "base",
            address: "ETH",
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            thumbnail: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501542",
        };

        if (tokenToSend !== "ETH") {
            tokenDetails = await getTokenFromRegistry(tokenToSend);
        }

        if (!tokenDetails) {
            return {
                success: false,
                error: "Can not find token details for " + tokenToSend + " on Base chain. Please give a valid token name/symbol/address.",
            };
        }

        return {
            success: true,
            signTransaction: true,
            data: {
                walletAddress,
                amount,
                tokenToSend: tokenDetails,
            },
        };
        } catch (error) {
            console.log(error, "error in transfer")
            return {
                success: false,
                error: "Error in transfer",
            };
        }
    },
};
