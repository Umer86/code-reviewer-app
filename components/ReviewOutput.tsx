
import React from 'react';
import type { CodeReview, ReviewFeedback } from '../types';
import { Loader } from './Loader';

interface ReviewOutputProps {
  review: CodeReview | null;
  isLoading: boolean;
  error: string | null;
}

const getCategoryStyles = (category: ReviewFeedback['category']) => {
  switch (category) {
    case 'Bug':
      return {
        bgColor: 'bg-red-900/50',
        borderColor: 'border-red-500',
        textColor: 'text-red-400',
        icon: '🐞',
      };
    case 'Performance':
      return {
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-400',
        icon: '⚡️',
      };
    case 'Security':
      return {
        bgColor: 'bg-purple-900/50',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-400',
        icon: '🛡️',
      };
    case 'Style':
      return {
        bgColor: 'bg-blue-900/50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-400',
        icon: '🎨',
      };
    case 'Best Practice':
    default:
      return {
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-500',
        textColor: 'text-green-400',
        icon: '✅',
      };
  }
};

const FeedbackItem: React.FC<{ item: ReviewFeedback }> = ({ item }) => {
  const styles = getCategoryStyles(item.category);
  return (
    <div className={`border-l-4 p-4 rounded-r-md ${styles.bgColor} ${styles.borderColor}`}>
      <div className="flex items-center mb-2">
        <span className="text-xl mr-2">{styles.icon}</span>
        <span className={`font-semibold ${styles.textColor}`}>{item.category}</span>
        {item.line > 0 && <span className="ml-auto text-sm text-gray-400">Line: {item.line}</span>}
      </div>
      <p className="text-gray-300 mb-3">{item.description}</p>
      {item.suggestion && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-1">Suggestion:</h4>
          <pre className="bg-gray-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
            <code>{item.suggestion}</code>
          </pre>
        </div>
      )}
    </div>
  );
};


export const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader className="h-12 w-12 text-cyan-500 mb-4" />
          <p className="text-lg text-gray-400">Analyzing your code...</p>
          <p className="text-sm text-gray-500 mt-2">This might take a moment for larger files.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
            <div className="bg-red-900/50 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-center">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        </div>
      );
    }

    if (!review) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-2xl font-semibold text-white">Ready for Review</h3>
          <p className="text-gray-400 mt-2 max-w-sm">
            Paste your code on the left, select the language, and click "Review Code" to get started.
          </p>
        </div>
      );
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Overall Summary</h3>
                <p className="text-gray-300 bg-gray-700/50 p-4 rounded-md">{review.overallSummary}</p>
            </div>
             <div>
                <h3 className="text-xl font-semibold text-white mb-4">Actionable Feedback</h3>
                <div className="space-y-4">
                    {review.feedback.length > 0 ? (
                        review.feedback.map((item, index) => <FeedbackItem key={index} item={item} />)
                    ) : (
                        <p className="text-gray-400 bg-gray-700/50 p-4 rounded-md">No specific feedback items found. Looks good!</p>
                    )}
                </div>
            </div>
        </div>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 min-h-[500px] lg:min-h-0 lg:h-full overflow-y-auto">
      {renderContent()}
    </div>
  );
};
