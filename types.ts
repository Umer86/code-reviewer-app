export interface ReviewFeedback {
  category: 'Bug' | 'Performance' | 'Style' | 'Best Practice' | 'Security' | 'Maintainability';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  line: number;
  description: string;
  suggestion?: string;
}

export interface CodeReview {
  overallSummary: string;
  feedback: ReviewFeedback[];
}

export interface BatchCodeReview {
  overallSummary: string;
  fileReviews: Record<string, CodeReview>;
}

export type AiModel = 'gemini' | 'claude' | 'chatgpt';

export interface AiModelOption {
  value: AiModel;
  label: string;
  isImplemented: boolean;
}

export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export interface ReviewHistoryItem {
  id: string;
  timestamp: string;
  files: CodeFile[];
  review: BatchCodeReview;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// --- Interfaces for AI Service Abstraction ---

export interface IChatSession {
  sendMessage(message: string): Promise<{ text: string }>;
}

export interface ICodeReviewerService {
  getCodeReview(code: string, language: string): Promise<CodeReview>;
  getBatchSummary(reviews: Record<string, CodeReview>): Promise<string>;
  startChat(codeFiles: CodeFile[], review: BatchCodeReview): Promise<IChatSession | null>;
  detectLanguage(code: string): Promise<string | null>;
}