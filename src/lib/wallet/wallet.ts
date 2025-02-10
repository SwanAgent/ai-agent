'use server';

import { getUserSessionData } from '@/server/actions/user';
import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from "@mysten/sui/transactions";
import prisma from '../prisma';
import { decryptPrivateKey } from './wallet-generator';
import { suiClient } from '../clients/sui-client';

/**
 * Server-side wallet interface
 */
class Wallet {
    private keypair: Ed25519Keypair;
    private client: SuiClient;
    
    constructor(keypair: Ed25519Keypair, client: SuiClient) {
        this.keypair = keypair;
        this.client = client;
    }

    /**
     * Get wallet address
     */
    getAddress(): string {
        return this.keypair.getPublicKey().toSuiAddress();
    }

    /**
     * Sign and execute a transaction
     */
    async signAndExecuteTransaction(transaction: Transaction): Promise<SuiTransactionBlockResponse> {
        const result = await this.client.signAndExecuteTransaction({ signer: this.keypair, transaction: transaction as any });
        return result;
    }
}

/**
 * Create a server wallet instance from an encrypted private key
 */
export async function getUserWallet(): Promise<Wallet | null> {
    try {
        const response = await getUserSessionData();
        if (!response?.data?.success || !response?.data?.data) {
            return null;
        }

        const userId = response.data.data.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallets: true
            },
        });
        if (!user) {
            return null;
        }
        const wallet = user.wallets[0];

        const privateKey = await decryptPrivateKey(wallet?.encryptedPrivateKey);
        const keypair = Ed25519Keypair.fromSecretKey(privateKey);
    
        return new Wallet(keypair, suiClient);
    } catch (error) {
        console.error('Failed to create server wallet:', error);
        throw new Error('Failed to create server wallet');
    }
}