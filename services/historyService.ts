import type { ReviewHistoryItem, BatchCodeReview, CodeFile } from '../types';

const HISTORY_STORAGE_KEY = 'geminiCodeReviewHistory';

export const getHistory = (): ReviewHistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Failed to parse history from localStorage', error);
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
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save review to localStorage', error);
  }
  
  return newHistory;
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history from localStorage', error);
  }
};
