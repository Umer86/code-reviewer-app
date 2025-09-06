
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';
import { Loader } from './Loader';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Your Code</h2>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
            aria-label="Select programming language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
      <div className="flex-grow flex flex-col">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`Paste your ${SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || 'code'} here...`}
          className="w-full flex-grow bg-gray-900 text-gray-300 font-mono p-4 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          spellCheck="false"
          aria-label="Code input area"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading || !code.trim()}
        className="mt-6 w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader className="h-5 w-5 mr-2" />
            Reviewing...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5 mr-2" />
            Review Code
          </>
        )}
      </button>
    </div>
  );
};
