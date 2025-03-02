'use server';

import { createCipheriv, createDecipheriv } from 'crypto';
import { randomBytes } from 'crypto';
import { KeyPair } from "near-api-js";
import { KeyPairString } from 'near-api-js/lib/utils';

/**
 * Generate encrypted keypair
 */
export async function generateEncryptedKeyPair() {
  const { publicKey, privateKey } = await generateExposedKeyPair();
  const encryptedPrivateKey = await WalletEncryption.encrypt(privateKey);
  return { publicKey, encryptedPrivateKey };
}

/**
 * Decrypt private key
 */
export async function decryptPrivateKey(encryptedPrivateKey: string) {
  return await WalletEncryption.decrypt(encryptedPrivateKey);
}

/**
 * Generate exposed keypair
 */
export async function generateExposedKeyPair() {
  // const keypair = KeyPair.fromRandom('ed25519');
  const keypair = KeyPair.fromString(process.env.NEAR_PRIVATE_KEY as KeyPairString ?? "ed25519:2222222222222222222222222222222222222222222222222222222222222222");
  const publicKey = keypair.getPublicKey().toString();
  const privateKey = keypair.toString();

  return {
    publicKey,
    privateKey,
  };
}

/**
 * Wallet encryption tool class
 */
class WalletEncryption {
  private static readonly algorithm = 'aes-256-cbc';
  private static readonly encryptionKey = Buffer.from(
    process.env.WALLET_ENCRYPTION_KEY!,
    'utf-8',
  ).subarray(0, 32);
  private static readonly ivLength = 16;

  static async encrypt(source: string): Promise<string> {
    try {
      const iv = randomBytes(this.ivLength);
      const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv);
      const encrypted = Buffer.concat([
        cipher.update(source, 'utf8'),
        cipher.final(),
      ]);
      const result = Buffer.concat([iv, encrypted]);
      return result.toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt private key');
    }
  }

  static async decrypt(encrypted: string): Promise<string> {
    try {
      if (!encrypted) {
        throw new Error('Missing encrypted private key');
      }

      const encryptedBuffer = Buffer.from(encrypted, 'base64');
      const iv = encryptedBuffer.subarray(0, this.ivLength);
      const encryptedContent = encryptedBuffer.subarray(this.ivLength);

      const decipher = createDecipheriv(this.algorithm, this.encryptionKey, iv);
      const decrypted = Buffer.concat([
        decipher.update(encryptedContent),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption failed:', error);
      if (error instanceof Error) {
        throw new Error(`Private key decryption failed: ${error.message}`);
      }
      throw new Error('Private key decryption failed');
    }
  }
}
