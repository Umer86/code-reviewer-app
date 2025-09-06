import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { ReviewOutput } from './components/ReviewOutput';
import { HistoryPanel } from './components/HistoryPanel';
import * as historyService from './services/historyService';
import { getAiService } from './services/aiServiceFactory';
import type { CodeReview, ReviewHistoryItem, CodeFile, BatchCodeReview, ChatMessage, AiModel, IChatSession } from './types';

interface ReviewProgress {
  total: number;
  completed: number;
  currentFile: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [batchReview, setBatchReview] = useState<BatchCodeReview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<ReviewProgress>({ total: 0, completed: 0, currentFile: '' });
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<AiModel>('gemini');

  // Chat state
  const [chatSession, setChatSession] = useState<IChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  useEffect(() => {
    setHistory(historyService.getHistory());
  }, []);

  const startChat = useCallback(async (codeFiles: CodeFile[], review: BatchCodeReview) => {
    try {
      const aiService = getAiService(selectedModel);
      const session = await aiService.startChat(codeFiles, review);
      setChatSession(session);
      setChatHistory([]);
       if (!session) {
          setError("Could not start a chat session with the selected AI model.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to initialize chat service.");
      setChatSession(null);
    }
  }, [selectedModel]);

  const handleReview = useCallback(async () => {
    if (files.length === 0) {
      setError('Please add some code or files to review.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBatchReview(null);
    setChatSession(null);
    setChatHistory([]);
    setProgress({ total: files.length, completed: 0, currentFile: files[0]?.name || '' });

    try {
      const aiService = getAiService(selectedModel);
      const fileReviews: Record<string, CodeReview> = {};

      for (const [index, file] of files.entries()) {
        setProgress(p => ({ ...p, completed: index, currentFile: file.name }));
        const result = await aiService.getCodeReview(file.content, file.language);
        fileReviews[file.name] = result;
      }
      
      setProgress(p => ({ ...p, completed: files.length, currentFile: 'Generating summary...' }));
      
      const overallSummary = files.length > 1
        ? await aiService.getBatchSummary(fileReviews)
        : fileReviews[files[0].name].overallSummary;

      const reviewResult = { overallSummary, fileReviews };
      setBatchReview(reviewResult);

      const newHistory = historyService.saveReview({ files, review: reviewResult });
      setHistory(newHistory);
      startChat(files, reviewResult);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress({ total: 0, completed: 0, currentFile: '' });
    }
  }, [files, selectedModel, startChat]);

  const handleSelectHistory = useCallback((item: ReviewHistoryItem) => {
    setFiles(item.files);
    setBatchReview(item.review);
    setError(null);
    // When loading from history, the chat will use the currently selected AI model.
    startChat(item.files, item.review);
  }, [startChat]);

  const handleClearHistory = useCallback(() => {
    historyService.clearHistory();
    setHistory([]);
  }, []);
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession || isChatLoading) return;
    
    setIsChatLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    
    try {
        const response = await chatSession.sendMessage(message);
        setChatHistory(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (err) {
        console.error("Chat error:", err);
        const errorMessage = err instanceof Error ? err.message : "Sorry, I couldn't get a response.";
        setChatHistory(prev => [...prev, { role: 'model', content: `Error: ${errorMessage}` }]);
    } finally {
        setIsChatLoading(false);
    }
  }, [chatSession, isChatLoading]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="col-span-12 xl:col-span-3">
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onClear={handleClearHistory}
            />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <CodeInput
              files={files}
              setFiles={setFiles}
              onSubmit={handleReview}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <ReviewOutput
              review={batchReview}
              isLoading={isLoading}
              progress={progress}
              error={error}
              onRetry={handleReview}
              chatHistory={chatHistory}
              isChatLoading={isChatLoading}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
