import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHistory, saveReview, clearHistory } from '../services/historyService';
import type { CodeFile, BatchCodeReview } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('historyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array if no history', () => {
    localStorageMock.getItem.mockReturnValue(null);
    expect(getHistory()).toEqual([]);
  });

  it('should save and retrieve history', () => {
    const mockData = { files: [] as CodeFile[], review: {} as BatchCodeReview };
    localStorageMock.getItem.mockReturnValue(null);
    const history = saveReview(mockData);
    expect(history.length).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should clear history', () => {
    clearHistory();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('geminiCodeReviewHistory');
  });
});
