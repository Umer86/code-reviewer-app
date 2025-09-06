
export interface ReviewFeedback {
  category: 'Bug' | 'Performance' | 'Style' | 'Best Practice' | 'Security';
  line: number;
  description: string;
  suggestion?: string;
}

export interface CodeReview {
  overallSummary: string;
  feedback: ReviewFeedback[];
}
