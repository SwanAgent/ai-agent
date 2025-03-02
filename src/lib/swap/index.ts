import {
  FT_MINIMUM_STORAGE_BALANCE_LARGE,
  TokenMetadata,
  Transaction,
  WRAP_NEAR_CONTRACT_ID,
  estimateSwap,
  fetchAllPools,
  ftGetTokenMetadata,
  getStablePools,
  instantSwap,
  nearDepositTransaction,
  nearWithdrawTransaction,
  transformTransactions,
  type EstimateSwapView,
  type Pool,
  type TransformedTransaction,
} from "@ref-finance/ref-sdk";
import { searchToken } from "./searchToken";
import { connect, KeyPair, keyStores, Account, utils } from "near-api-js";
import BN from "bn.js";
import { KeyPairString } from "near-api-js/lib/utils";
import { AllowlistedToken } from "./allowlistedTokens";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
const REFERRAL_ID = "coldcap3719.near";
const ACCOUNT_ID = "4e99ff946804f3ec84d74a93cec43e1607482c4a75e81e289c9d1f1fa682986d"
const networkId = "mainnet"
const PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY ?? ""

const config = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.near.org',
  WRAP_NEAR_CONTRACT_ID: 'wrap.near',
  REF_FI_CONTRACT_ID: 'v2.ref-finance.near',
  REF_TOKEN_ID: 'token.v2.ref-finance.near',
  indexerUrl: 'https://indexer.ref.finance',
  explorerUrl: 'https://testnet.nearblocks.io',
  REF_DCL_SWAP_CONTRACT_ID: 'dclv2.ref-labs.near',
};

async function checkStorageBalance(
  account: Account,
  contractId: string
): Promise<boolean> {
  console.log(contractId)
  try {
    const balance = await account.viewFunction({
      contractId,
      methodName: "storage_balance_of",
      args: { account_id: account.accountId }
    });
    return balance !== null && balance.total !== "0";
  } catch (error) {
    console.log(`Error checking storage balance: ${error}`);
    return false;
  }
}

export async function fetchQuote(tokenIn: AllowlistedToken, tokenOut: AllowlistedToken, quantity: string, accountId: string) {
  const { ratedPools, unRatedPools, simplePools } = await fetchAllPools();

  const stablePools: Pool[] = unRatedPools.concat(ratedPools);

  // remove low liquidity DEGEN_SWAP pools
  const nonDegenStablePools = stablePools.filter(
    (pool) => pool.pool_kind !== "DEGEN_SWAP"
  );

  const nonDegenStablePoolsDetails = await getStablePools(
    nonDegenStablePools
  );

  const isNearIn = tokenIn.id === "wrap.near";
  const isNearOut = tokenOut.id === "wrap.near";

  const [tokenInData, tokenOutData] = await Promise.all([
    ftGetTokenMetadata(tokenIn.id),
    ftGetTokenMetadata(tokenOut.id),
  ]);

  if (tokenInData.id === WRAP_NEAR_CONTRACT_ID && isNearOut) {
    return {
      totalAmountOut: quantity,
      tokenIn: tokenInData,
      tokenOut: tokenOutData,
    }
  }

  if (isNearIn && tokenOutData.id === WRAP_NEAR_CONTRACT_ID) {
    return {
      totalAmountOut: quantity,
      tokenIn: tokenInData,
      tokenOut: tokenOutData,
    }
  }

  const refEstimateSwap = (enableSmartRouting: boolean) => {
    return estimateSwap({
      tokenIn: tokenInData,
      tokenOut: tokenOutData,
      amountIn: quantity,
      simplePools,
      options: {
        enableSmartRouting,
        stablePools: nonDegenStablePools,
        stablePoolsDetail: nonDegenStablePoolsDetails,
      },
    });
  };

  const swapTodos: EstimateSwapView[] = await refEstimateSwap(true).catch(
    () => {
      return refEstimateSwap(false); // fallback to non-smart routing if unsupported
    }
  );

  const slippageTolerance = getSlippageTolerance();

  const totalAmountOut = swapTodos.reduce((acc, todo) => {
    if (todo.outputToken === tokenOut.id) {
      return acc + parseFloat(todo.estimate);
    }
    return acc;
  }, 0);

  return {
    totalAmountOut: totalAmountOut.toString(),
    tokenIn: tokenInData,
    tokenOut: tokenOutData,
  }
}


async function getTransactionMessages(tokenIn: TokenMetadata, tokenOut: TokenMetadata, accountId: string, amountIn: string): Promise<TransformedTransaction[] | { error: string }> {
  const { ratedPools, unRatedPools, simplePools } = await fetchAllPools();

  const stablePools: Pool[] = unRatedPools.concat(ratedPools);

  // remove low liquidity DEGEN_SWAP pools
  const nonDegenStablePools = stablePools.filter(
    (pool) => pool.pool_kind !== "DEGEN_SWAP"
  );

  const nonDegenStablePoolsDetails = await getStablePools(
    nonDegenStablePools
  );

  const isNearIn = tokenIn.id === WRAP_NEAR_CONTRACT_ID;
  const isNearOut = tokenOut.id === WRAP_NEAR_CONTRACT_ID;

  if (tokenIn.id === WRAP_NEAR_CONTRACT_ID && isNearOut) {
    return transformTransactions(
      [nearWithdrawTransaction(amountIn)],
      accountId
    );
  }

  if (isNearIn && tokenOut.id === WRAP_NEAR_CONTRACT_ID) {
    return transformTransactions(
      [nearDepositTransaction(amountIn)],
      accountId
    );
  }

  if (tokenIn.id === tokenOut.id && isNearIn === isNearOut) {
    return { error: "TokenIn and TokenOut cannot be the same" };
  }

  const refEstimateSwap = (enableSmartRouting: boolean) => {
    return estimateSwap({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      simplePools,
      options: {
        enableSmartRouting,
        stablePools: nonDegenStablePools,
        stablePoolsDetail: nonDegenStablePoolsDetails,
      },
    });
  };

  const swapTodos = await refEstimateSwap(true).catch(
    () => {
      return refEstimateSwap(false); // fallback to non-smart routing if unsupported
    }
  );

  const slippageTolerance = getSlippageTolerance();

  console.log("swapTodos", swapTodos)
  const refSwapTransactions = await instantSwap({
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amountIn: amountIn,
    swapTodos,
    slippageTolerance,
    AccountId: accountId,
    referralId: REFERRAL_ID,
  });

  console.log("refSwapTransactions", refSwapTransactions)
  if (isNearIn) {
    // wrap near
    refSwapTransactions.unshift(nearDepositTransaction(amountIn));
  }

  const account = await getAccount()
  const hasStorageIn = await checkStorageBalance(account, tokenIn.id);

  console.log("hasStorageIn", hasStorageIn)
  // If storage deposit is needed, add it to transactions
  if (!hasStorageIn) {
    refSwapTransactions.unshift({
      receiverId: tokenIn.id,
      functionCalls: [
        {
          methodName: "storage_deposit",
          args: {
            account_id: accountId,
            registration_only: true,
          },
          gas: "30000000000000",
          amount: utils.format.formatNearAmount(FT_MINIMUM_STORAGE_BALANCE_LARGE),
        },
      ],
    });
  }


  if (isNearOut) {
    const lastFunctionCall = refSwapTransactions
      .at(-1)
      ?.functionCalls.at(-1);

    const args = lastFunctionCall?.args;

    if (args && "msg" in args && typeof args.msg === "string") {
      const argsMsgObj = JSON.parse(args.msg);

      argsMsgObj.skip_unwrap_near = false;

      lastFunctionCall.args = {
        ...lastFunctionCall.args,
        msg: JSON.stringify(argsMsgObj),
      };
    }
  }
  return transformTransactions(refSwapTransactions, accountId);
}

const DEFAULT_SLIPPAGE_TOLERANCE = 2; // 2%

export const getSlippageTolerance = (slippage?: string): number => {
  const tolerance = slippage ? Number.parseFloat(slippage) : null;
  if (tolerance === null || Number.isNaN(tolerance) || tolerance <= 0 || tolerance >= 100) {
    return DEFAULT_SLIPPAGE_TOLERANCE;
  }
  return tolerance;
}

const getAccount = async () => {
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(PRIVATE_KEY as KeyPairString);
  await keyStore.setKey(config.networkId, ACCOUNT_ID, keyPair);

  // Connect to NEAR
  const near = await connect({ ...config, keyStore, headers: {} });
  const account: Account = await near.account(ACCOUNT_ID);

  console.log(await account.getAccountBalance())
  return account;
}

export const executeSwap = async (tokenIn: TokenMetadata, tokenOut: TokenMetadata, accountId: string, amountIn: string) => {
  const account = await getAccount();

  const transactionMessages = await getTransactionMessages(tokenIn, tokenOut, accountId, amountIn);

  console.log("transactionMessages", transactionMessages)
  if ("error" in transactionMessages) {
    return {
      success: false,
      error: transactionMessages.error,
    };
  }



  const hashes: string[] = [];
  let swapHash = "test"
  // for (const tx of transactionMessages) {
  //   const result = await account.functionCall({
  //     contractId: tx.receiverId,
  //     methodName: tx.actions[0].params.methodName,
  //     args: tx.actions[0].params.args,
  //     gas: BigInt(tx.actions[0].params.gas),
  //     attachedDeposit: BigInt(tx.actions[0].params.deposit),
  //   });

  //   if (result.transaction.actions[0].params.methodName === "ft_transfer_call") {
  //     swapHash = result.transaction.hash;
  //   }
  //   hashes.push(result.transaction.hash);
  // }

  return {
    success: true,
    hash: swapHash,
  };
}

// (async () => {
//   const transactions = await swapTransaction({
//     tokenIn: "near",
//     tokenOut: "usdt",
//     quantity: "0.0001"
//   })
//   console.log("ref fin transaction", JSON.stringify(transactions, null, 2))

//   if ("error" in transactions) {
//     console.log(transactions.error)
//     return
//   }

//   const account = await getAccount();

//   const hashes: string[] = [];
//   let swapHash = ""
//   for (const tx of transactions) {
//     const result = await account.functionCall({
//       contractId: tx.receiverId,
//       methodName: tx.actions[0].params.methodName,
//       args: tx.actions[0].params.args,
//       gas: BigInt(tx.actions[0].params.gas),
//       attachedDeposit: BigInt(tx.actions[0].params.deposit),
//     });

//     if (result.transaction.actions[0].params.methodName === "ft_transfer_call") {
//       swapHash = result.transaction.hash;
//     }
//     hashes.push(result.transaction.hash);
//   }

//   console.log("hashes", hashes)
// })