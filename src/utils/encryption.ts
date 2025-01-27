import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const IV_LENGTH = 16; // For AES, the IV length is always 16 bytes

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    "ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes)."
  );
}

/**
 * Encrypts a string using AES-256-CBC
 * @param text - The text to encrypt
 * @returns The encrypted text in 'iv:encrypted' format
 */
export const encryptString = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * Decrypts an encrypted string using AES-256-CBC
 * @param encryptedText - The encrypted text in 'iv:encrypted' format
 * @returns The original decrypted text
 */
export const decryptString = (encryptedText: string): string => {
  const [iv, encrypted] = encryptedText.split(":");
  if (!iv || !encrypted) {
    throw new Error("Invalid encrypted text format.");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};