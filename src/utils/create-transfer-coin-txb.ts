import { CoinObject } from "@/types/assets";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { suiProvider } from "@/lib/services/sui-provider";

export const DEFAULT_GAS_BUDGET = 20_000_000;

function createTransferSuiCoinTxb(amount: bigint, recipient: string) {
  const txb = new Transaction();
  // split the coin to be sent from the gas coins
  const coin = txb.splitCoins(txb.gas, [amount]);
  txb.transferObjects([coin], recipient);
  return txb;
}

function createTransferCustomCoinTxb(
  coins: CoinObject[],
  coinType: string,
  amount: bigint,
  recipient: string
) {
  const txb = new Transaction();
  // split the primary coin and merge the rest
  const [primaryCoin, ...mergeCoins] = coins.filter(
    (coin) => coin.type === coinType
  );
  // TODO: pass the object instead of the id
  const primaryCoinInput = txb.object(primaryCoin.objectId);
  if (mergeCoins.length) {
    // TODO: This could just merge a subset of coins that meet the balance requirements instead of all of them.
    txb.mergeCoins(
      primaryCoinInput,
      mergeCoins.map((coin) => txb.object(coin.objectId))
    );
  }
  // TODO: pass gas coin object instead of pure amount, which can avoid unnecessary network calls
  const coin = txb.splitCoins(primaryCoinInput, [amount]);
  txb.transferObjects([coin], recipient);
  return txb;
}

/**
 * Create a transaction block for transferring a type of coin.
 * @param ownedCoins coins owned by the sender.
 * @param coinType The type of coin to transfer.
 * @param amount The amount of coins to transfer.
 * @param recipient The recipient of the coins.
 */
function createTransferCoinTxb(
  ownedCoins: CoinObject[],
  coinType: string, // such as 0x2::sui::SUI
  amount: bigint,
  recipient: string
) {
  if (coinType === SUI_TYPE_ARG) {
    return createTransferSuiCoinTxb(amount, recipient);
  } else {
    return createTransferCustomCoinTxb(
      ownedCoins,
      coinType,
      amount,
      recipient
    );
  }
}

export async function getTransferCoinTxb(
  coinType: string,
  amount: bigint,
  recipient: string,
  address: string
): Promise<Transaction> {
  // NOTE: only query coins with the exact amount
  // if user has a lot of coins, to avoid performance issues
  let filterAmount = amount;
  if (coinType === SUI_TYPE_ARG) {
    filterAmount += BigInt(DEFAULT_GAS_BUDGET); // plus gas budget as max limit for sui coin
  }
  const coins = await suiProvider.getOwnedCoin(address, coinType, {
    amount: filterAmount,
  });
  if (coins.length === 0) {
    throw new Error("No coin to transfer");
  }
  return createTransferCoinTxb(coins, coinType, amount, recipient);
}
