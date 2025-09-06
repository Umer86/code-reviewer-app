import type { ICodeReviewerService, IChatSession, CodeReview, CodeFile, BatchCodeReview } from '../../types';

class ClaudeService implements ICodeReviewerService {
  private readonly notImplementedError = new Error('Claude AI service is not yet implemented.');

  getCodeReview(code: string, language: string): Promise<CodeReview> {
    throw this.notImplementedError;
  }

  getBatchSummary(reviews: Record<string, CodeReview>): Promise<string> {
    throw this.notImplementedError;
  }

  startChat(codeFiles: CodeFile[], review: BatchCodeReview): Promise<IChatSession | null> {
    throw this.notImplementedError;
  }

  detectLanguage(code: string): Promise<string | null> {
    throw this.notImplementedError;
  }
}

export const claudeService = new ClaudeService();