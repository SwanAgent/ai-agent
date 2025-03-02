import { PublicKey } from 'near-api-js/lib/utils';
import * as borsh from 'borsh';
import { sha256 } from 'js-sha256';
import { NEAR_NETWORK } from '@/constant';

/**
 * Verifies a signature using the NEAR standard message signing format
 * 
 * @param accountId - The NEAR account ID that signed the message
 * @param publicKey - The public key used to sign (in string format)
 * @param signature - The signature to verify (base64 encoded)
 * @param message - The original message that was signed
 * @param recipient - The recipient domain (usually your app's domain)
 * @param nonce - The nonce used when creating the signature
 * @returns A boolean indicating whether the signature is valid
 */
export async function authenticateSignedMessage({
    accountId,
    publicKey,
    signature,
    message,
    recipient,
    nonce
}: {
    accountId: string;
    publicKey: string;
    signature: string;
    message: string;
    recipient: string;
    nonce: Uint8Array;
}): Promise<boolean> {
    try {
        // Verify the signature matches the payload
        const validSignature = verifyMessageSignature({
            publicKey,
            signature,
            message,
            recipient,
            nonce
        });

        // Verify the key belongs to the user and is a full access key
        const keyBelongsToUser = await verifyFullKeyBelongsToUser({
            accountId,
            publicKey
        });

        // Both conditions must be true for authentication to succeed
        return validSignature && keyBelongsToUser;
    } catch (error) {
        console.error('Error authenticating signed message:', error);
        return false;
    }
}

/**
 * Verifies that a signature matches the expected payload
 */
function verifyMessageSignature({
    publicKey,
    signature,
    message,
    recipient,
    nonce
}: {
    publicKey: string;
    signature: string;
    message: string;
    recipient: string;
    nonce: Uint8Array;
}): boolean {
    try {
        // Reconstruct the expected payload to be signed
        const payload = new Payload({ message, recipient, nonce });
        const serialized = borsh.serialize(payloadSchema, payload);
        const toSign = Uint8Array.from(sha256.array(serialized));

        // Decode the signature from base64
        const signatureBytes = Buffer.from(signature, 'base64');

        // Use the public key to verify the signature
        const nearPublicKey = PublicKey.from(publicKey);
        return nearPublicKey.verify(toSign, signatureBytes);
    } catch (error) {
        console.error('Error verifying message signature:', error);
        return false;
    }
}

/**
 * Verifies that a public key belongs to a user and is a full access key
 */
async function verifyFullKeyBelongsToUser({
    accountId,
    publicKey
}: {
    accountId: string;
    publicKey: string;
}): Promise<boolean> {
    try {
        // Fetch all the user's keys from the NEAR RPC
        const data = await fetchAllUserKeys({ accountId });

        // If there are no keys, the user could not have signed it
        if (!data || !data.result || !data.result.keys) {
            return false;
        }

        // Check all keys to see if we find the used key
        for (const key of data.result.keys) {
            if (key.public_key === publicKey) {
                // Ensure the key is full access
                return key.access_key.permission === "FullAccess";
            }
        }

        return false; // Key not found
    } catch (error) {
        console.error('Error verifying key belongs to user:', error);
        return false;
    }
}

/**
 * Fetches all access keys for a NEAR account
 */
async function fetchAllUserKeys({
    accountId
}: {
    accountId: string;
}): Promise<any> {
    try {
        const rpcUrl = NEAR_NETWORK === "mainnet"
            ? "https://rpc.mainnet.near.org"
            : "https://rpc.testnet.near.org";

        const response = await fetch(
            rpcUrl,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "query",
                    params: ["access_key/" + accountId, ""],
                    id: 1
                })
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Error fetching user keys:', error);
        return null;
    }
}

/**
 * Payload class for NEAR message signing
 * This follows the NEAR standard for message signing
 */
export class Payload {
    tag: number;
    message: string;
    nonce: Uint8Array;
    recipient: string;
    callbackUrl?: string;

    constructor({ message, nonce, recipient, callbackUrl }: {
        message: string;
        nonce: Uint8Array;
        recipient: string;
        callbackUrl?: string
    }) {
        this.tag = 2147484061; // NEAR standard tag for message signing
        this.message = message;
        this.nonce = nonce;
        this.recipient = recipient;
        if (callbackUrl) {
            this.callbackUrl = callbackUrl;
        }
    }
}

/**
 * Schema for borsh serialization of the payload
 */
export const payloadSchema = {
    struct: {
        tag: 'u32',
        message: 'string',
        nonce: { array: { type: 'u8', len: 32 } },
        recipient: 'string',
        callbackUrl: { option: "string" }
    }
};