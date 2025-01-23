"use server";

import { getUserWallet } from "@/lib/wallet/wallet";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export async function executeTransaction(transaction: string): Promise<SuiTransactionBlockResponse | null> {
    const wallet = await getUserWallet();
    if (!wallet) return null;
    const tx = Transaction.from(transaction);
    const result: SuiTransactionBlockResponse = await wallet.signAndExecuteTransaction(tx);
    return result;
}