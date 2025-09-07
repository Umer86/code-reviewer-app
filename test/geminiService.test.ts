import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import { geminiService } from '../services/geminiService';

// Mock the GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockImplementation(({ contents }) => {
        // Check if this is a language detection request
        if (contents.includes('Analyze the following code snippet and identify its programming language')) {
          return Promise.resolve({
            text: JSON.stringify({
              language: 'javascript'
            })
          });
        }
        // Default response for code review
        return Promise.resolve({
          text: JSON.stringify({
            overallSummary: 'Good code',
            feedback: []
          })
        });
      })
    },
    chats: {
      create: vi.fn().mockReturnValue({
        sendMessage: vi.fn().mockResolvedValue({ text: 'Response' })
      })
    }
  })),
  Type: {
    OBJECT: 'object',
    STRING: 'string',
    ARRAY: 'array',
    INTEGER: 'integer'
  }
}));

describe('geminiService', () => {
  beforeEach(() => {
    process.env.API_KEY = 'test-key';
  });

  it('should get code review', async () => {
    const review = await geminiService.getCodeReview('console.log("test");', 'javascript');
    expect(review).toHaveProperty('overallSummary');
    expect(review).toHaveProperty('feedback');
  });

  it('should detect language', async () => {
    const lang = await geminiService.detectLanguage('console.log("test");');
    expect(lang).toBe('javascript');
  });
});
