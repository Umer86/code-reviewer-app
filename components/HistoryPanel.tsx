import React from 'react';
import type { ReviewHistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';

interface HistoryPanelProps {
  history: ReviewHistoryItem[];
  onSelect: (item: ReviewHistoryItem) => void;
  onClear: () => void;
}

const generateHistoryTitle = (files: ReviewHistoryItem['files']): string => {
  if (!files || files.length === 0) {
    return 'Empty Review';
  }

  if (files.length === 1) {
    const file = files[0];
    return file.name.startsWith('pasted_code.') ? 'Pasted Code' : file.name;
  }

  const firstTwoNames = files.slice(0, 2).map(f => f.name).join(', ');
  const remainingCount = files.length - 2;

  if (remainingCount > 0) {
    return `${firstTwoNames}, +${remainingCount} more`;
  }

  return firstTwoNames;
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <HistoryIcon className="h-6 w-6 mr-2 text-cyan-500" />
          Review History
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-400 hover:text-white hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
            aria-label="Clear review history"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto -mr-3 pr-3">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <p>Your past reviews will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item)}
                  className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <p className="font-semibold text-white truncate" title={item.files.map(f => f.name).join(', ')}>
                    {generateHistoryTitle(item.files)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};