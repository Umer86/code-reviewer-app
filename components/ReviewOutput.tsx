import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { BatchCodeReview, ReviewFeedback, ChatMessage } from '../types';
import { Loader } from './Loader';
import { WarningIcon } from './icons/WarningIcon';
import { SendIcon } from './icons/SendIcon';
import DOMPurify from 'dompurify';
import { sanitizeInput } from '../utils/sanitization';


interface ReviewOutputProps {
  review: BatchCodeReview | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  progress: {
    total: number;
    completed: number;
    currentFile: string;
  };
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (message: string) => void;
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
    case 'Maintainability':
      return {
        bgColor: 'bg-teal-900/50',
        borderColor: 'border-teal-500',
        textColor: 'text-teal-400',
        icon: '🔧',
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

const getSeverityStyles = (severity: ReviewFeedback['severity']) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-600 text-white';
    case 'High':
      return 'bg-orange-500 text-white';
    case 'Medium':
      return 'bg-yellow-500 text-gray-900';
    case 'Low':
      return 'bg-blue-500 text-white';
    case 'Info':
    default:
      return 'bg-gray-600 text-white';
  }
};

const FeedbackItem: React.FC<{ item: ReviewFeedback }> = ({ item }) => {
  const styles = getCategoryStyles(item.category);
  const severityStyles = getSeverityStyles(item.severity);
  return (
    <div className={`border-l-4 p-4 rounded-r-md ${styles.bgColor} ${styles.borderColor}`}>
      <div className="flex items-center mb-2 flex-wrap gap-2">
        <span className="text-xl mr-2">{styles.icon}</span>
        <span className={`font-semibold ${styles.textColor}`}>{item.category}</span>
        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${severityStyles}`}>
          {item.severity}
        </span>
        {item.line > 0 && <span className="ml-auto text-sm text-gray-400">Line: {item.line}</span>}
      </div>
      <p className="text-gray-300 mb-3">{item.description}</p>
      {item.suggestion && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-1">Suggestion:</h4>
          <pre className="bg-gray-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
            <code>{DOMPurify.sanitize(item.suggestion, { ALLOWED_TAGS: [] })}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

const FileReviewDetails: React.FC<{ review: BatchCodeReview['fileReviews'][string] }> = ({ review }) => {
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('line');

    const CATEGORIES: ReviewFeedback['category'][] = ['Bug', 'Performance', 'Style', 'Best Practice', 'Security', 'Maintainability'];

    const processedFeedback = useMemo(() => {
        let filtered = review.feedback.filter(item => 
            filterCategory === 'all' || item.category === filterCategory
        );

        const severityScores: Record<ReviewFeedback['severity'], number> = {
            'Critical': 5,
            'High': 4,
            'Medium': 3,
            'Low': 2,
            'Info': 1,
        };

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'severity-desc') {
                return (severityScores[b.severity] || 0) - (severityScores[a.severity] || 0);
            }
            if (sortBy === 'severity-asc') {
                return (severityScores[a.severity] || 0) - (severityScores[b.severity] || 0);
            }
            // Default to 'line'
            return a.line - b.line;
        });
        
        return sorted;
    }, [review.feedback, filterCategory, sortBy]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">File Summary</h3>
                <p className="text-gray-300 bg-gray-700/50 p-4 rounded-md text-sm">{review.overallSummary}</p>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-white mb-4">Actionable Feedback</h3>
                
                {review.feedback.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 bg-gray-900/50 p-3 rounded-md">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <label htmlFor="filter-category" className="text-sm font-medium text-gray-400 flex-shrink-0">Filter by:</label>
                            <select
                                id="filter-category"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                aria-label="Filter feedback by category"
                            >
                                <option value="all">All Categories</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <label htmlFor="sort-by" className="text-sm font-medium text-gray-400 flex-shrink-0">Sort by:</label>
                            <select
                                id="sort-by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                aria-label="Sort feedback"
                            >
                                <option value="line">Line Number</option>
                                <option value="severity-desc">Severity (High to Low)</option>
                                <option value="severity-asc">Severity (Low to High)</option>
                            </select>
                        </div>
                    </div>
                )}
                
                <div className="space-y-4" role="list" aria-label="Code review feedback">
                    {processedFeedback.length > 0 ? (
                        processedFeedback.map((item, index) => <FeedbackItem key={`${item.line}-${item.category}-${index}`} item={item} />)
                    ) : (
                        <p className="text-gray-400 bg-gray-700/50 p-4 rounded-md">
                           {filterCategory === 'all' 
                                ? "No specific feedback items found. Looks good!"
                                : `No feedback items found for the "${filterCategory}" category.`
                           }
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatInterface: React.FC<{ 
    history: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}> = ({ history, isLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    return (
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-4">Follow-up Chat</h3>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4" role="log" aria-label="Chat history">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-700 text-white' : 'bg-gray-600 text-gray-200'}`}>
                           <p className="text-sm whitespace-pre-wrap">{DOMPurify.sanitize(msg.content, { ALLOWED_TAGS: [] })}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg bg-gray-600 text-gray-200 flex items-center">
                            <Loader className="h-4 w-4 mr-2" />
                            <span className="text-sm italic">AI is typing...</span>
                        </div>
                    </div>
                )}
                 <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(sanitizeInput(DOMPurify.sanitize(e.target.value, { ALLOWED_TAGS: [] }), 1000))}
                    placeholder="Ask a follow-up question..."
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading}
                    aria-label="Chat input"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold p-2 rounded-md transition-colors"
                    aria-label="Send message"
                >
                    <SendIcon className="h-5 w-5" />
                </button>
            </form>
        </div>
    );
};


export const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, isLoading, error, onRetry, progress, chatHistory, isChatLoading, onSendMessage }) => {
  const fileNames = review ? Object.keys(review.fileReviews) : [];
  const [activeTab, setActiveTab] = useState('summary');
  
  React.useEffect(() => {
      // Reset to summary tab when a new review comes in
      setActiveTab('summary');
  }, [review]);
  
  const TabButton: React.FC<{tabId: string, children: React.ReactNode}> = ({ tabId, children }) => (
      <button 
        onClick={() => setActiveTab(tabId)}
        className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap focus:outline-none transition-colors ${activeTab === tabId ? 'bg-cyan-600 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'}`}
      >
        {children}
      </button>
  );

  const renderContent = () => {
    if (isLoading && !error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader className="h-12 w-12 text-cyan-500 mb-4" />
          <p className="text-lg text-gray-400">Analyzing your code...</p>
          {progress.total > 0 && (
              <div className="w-full max-w-xs mt-4">
                  <p className="text-sm text-gray-500 truncate mb-1" title={progress.currentFile}>{progress.currentFile}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(progress.completed / progress.total) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress.completed} of {progress.total} files</p>
              </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-red-900/50 border border-red-500 text-red-400 p-6 rounded-lg max-w-md w-full">
                <div className="flex items-center justify-center mb-4">
                  <WarningIcon className="h-8 w-8 mr-3" />
                  <strong className="text-xl font-bold">Request Failed</strong>
                </div>
                <p className="mb-6 text-gray-300">{error}</p>
                <button
                  onClick={onRetry}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200"
                >
                  {isLoading ? <><Loader className="h-5 w-5 mr-2" />Retrying...</> : 'Retry'}
                </button>
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
            Upload files or paste code on the left and click "Review" to get started.
          </p>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <h2 className="text-xl font-semibold text-white mb-3">Review Results</h2>
                <div className="flex items-center border-b border-gray-700 overflow-x-auto pb-2 space-x-2">
                    <TabButton tabId="summary">Overall Summary</TabButton>
                    {fileNames.map(name => (
                        <TabButton key={name} tabId={name}>{name}</TabButton>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex-grow overflow-y-auto pr-2 -mr-2 min-h-0">
                {activeTab === 'summary' ? (
                     <p className="text-gray-300 bg-gray-700/50 p-4 rounded-md">{review.overallSummary}</p>
                ) : (
                    review.fileReviews[activeTab] && <FileReviewDetails review={review.fileReviews[activeTab]} />
                )}
            </div>
            <div className="flex-shrink-0">
                 <ChatInterface 
                    history={chatHistory} 
                    isLoading={isChatLoading} 
                    onSendMessage={onSendMessage} 
                />
            </div>
        </div>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 min-h-[500px] lg:h-full flex flex-col">
      {renderContent()}
    </div>
  );
};
