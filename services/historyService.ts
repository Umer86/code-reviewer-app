import type { ReviewHistoryItem, BatchCodeReview, CodeFile } from '../types';
import CryptoJS from 'crypto-js';

const HISTORY_STORAGE_KEY = 'geminiCodeReviewHistory';
const ENCRYPTION_KEY_STORAGE = 'app_encryption_key';

// Generate or retrieve encryption key dynamically
const getEncryptionKey = (): string => {
  let key = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);
  if (!key) {
    // Generate a random key for this session
    key = CryptoJS.lib.WordArray.random(256/8).toString();
    sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
  }
  return key;
};

// Alternative: User-provided passphrase for stronger security
const getUserEncryptionKey = (): string => {
  const userKey = prompt('Enter a passphrase to encrypt your history (leave empty for automatic):');
  if (userKey && userKey.trim()) {
    return CryptoJS.SHA256(userKey.trim()).toString();
  }
  return getEncryptionKey();
};

export const getHistory = (): ReviewHistoryItem[] => {
  try {
    const encryptedHistoryJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!encryptedHistoryJson) return [];
    
    const encryptionKey = getEncryptionKey();
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedHistoryJson, encryptionKey);
    const decryptedJson = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedJson) {
      console.warn('Failed to decrypt history - possibly corrupted or wrong key');
      // Clear corrupted data and start fresh
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
      return [];
    }
    
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error('Failed to parse or decrypt history from localStorage', error);
    // Clear corrupted data
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
    return [];
  }
};

export const saveReview = (data: { files: CodeFile[]; review: BatchCodeReview }): ReviewHistoryItem[] => {
  const newHistoryItem: ReviewHistoryItem = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...data,
  };

  const currentHistory = getHistory();
  const newHistory = [newHistoryItem, ...currentHistory].slice(0, 50); // Keep last 50 reviews

  try {
    const historyJson = JSON.stringify(newHistory);
    const encryptionKey = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(historyJson, encryptionKey).toString();
    localStorage.setItem(HISTORY_STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Failed to encrypt and save review to localStorage', error);
  }
  
  return newHistory;
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
  } catch (error) {
    console.error('Failed to clear history from localStorage', error);
  }
};
