import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.AI_ENCRYPTION_KEY || 'default-secret-key-change-it-in-env';

export function encrypt(text: string): string {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}
