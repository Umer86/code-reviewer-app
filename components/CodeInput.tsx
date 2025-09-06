import React, { useState, useCallback, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP, MAX_FILE_SIZE, SUPPORTED_FILE_EXTENSIONS, SUPPORTED_MODELS } from '../constants';
import { getAiService } from '../services/aiServiceFactory';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Loader } from './Loader';
import type { CodeFile, AiModel } from '../types';

interface CodeInputProps {
  files: CodeFile[];
  setFiles: (files: CodeFile[]) => void;
  onSubmit: () => void;
  isLoading: boolean;
  selectedModel: AiModel;
  onModelChange: (model: AiModel) => void;
}

const PasteCodeInput: React.FC<{
    onFileUpdate: (file: CodeFile) => void;
    selectedModel: AiModel;
}> = ({ onFileUpdate, selectedModel }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const [isDetecting, setIsDetecting] = useState(false);

  // Update parent component when code or language changes
  useEffect(() => {
    onFileUpdate({
      name: `pasted_code.${Object.keys(LANGUAGE_MAP).find(key => LANGUAGE_MAP[key] === language) || 'txt'}`,
      language,
      content: code,
    });
  }, [code, language, onFileUpdate]);

  // Debounced language detection
  useEffect(() => {
    const codeToDetect = code.trim();
    if (!codeToDetect) return;

    const handler = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const aiService = getAiService(selectedModel);
        if (aiService.detectLanguage) {
            const detectedLang = await aiService.detectLanguage(codeToDetect);
            if (detectedLang && SUPPORTED_LANGUAGES.some(l => l.value === detectedLang)) {
              setLanguage(detectedLang);
            }
        }
      } catch (error) {
        console.error("Language detection failed:", error);
      } finally {
        setIsDetecting(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [code, selectedModel]);


  return (
    <div className="flex flex-col h-full">
        <div className="relative mb-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              aria-label="Select programming language"
              disabled={isDetecting}
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
            {isDetecting && <div className="absolute inset-y-0 right-8 flex items-center pr-1"><Loader className="h-5 w-5 text-cyan-500"/></div>}
          </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`Paste your ${SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || 'code'} here... (language will be auto-detected)`}
          className="w-full flex-grow bg-gray-900 text-gray-300 font-mono p-4 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          spellCheck="false"
          aria-label="Code input area"
        />
    </div>
  )
}

const FileUploadInput: React.FC<{ files: CodeFile[], setFiles: (files: CodeFile[]) => void }> = ({ files, setFiles }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileRead = useCallback((file: File): Promise<CodeFile> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!SUPPORTED_FILE_EXTENSIONS.includes(extension)) {
        return reject(new Error(`File type .${extension} is not supported.`));
      }
      if (file.size > MAX_FILE_SIZE) {
        return reject(new Error(`File size exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve({
          name: file.name,
          language: LANGUAGE_MAP[extension] || 'plaintext',
          content: content,
        });
      };
      reader.onerror = (e) => reject(new Error("Failed to read file."));
      reader.readAsText(file);
    });
  }, []);

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: CodeFile[] = [];
    for (const file of Array.from(fileList)) {
      try {
        const codeFile = await handleFileRead(file);
        // Avoid duplicates
        if (!files.some(f => f.name === codeFile.name)) {
          newFiles.push(codeFile);
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : String(error));
      }
    }
    setFiles([...files, ...newFiles]);
  }, [files, setFiles, handleFileRead]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [processFiles]);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const removeFile = (fileName: string) => {
      setFiles(files.filter(f => f.name !== fileName));
  };
  
  const handleLanguageChange = (fileName: string, newLanguage: string) => {
    setFiles(files.map(f =>
      f.name === fileName ? { ...f, language: newLanguage } : f
    ));
  };

  return (
    <div className="flex flex-col h-full">
        <div 
          onDrop={handleDrop}
          onDragEnter={handleDragEvents}
          onDragOver={handleDragEvents}
          onDragLeave={handleDragEvents}
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-40 transition-colors ${isDragging ? 'border-cyan-500 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-600'}`}
        >
          <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-400">Drag & drop files here</p>
          <p className="text-sm text-gray-500">or</p>
          <label className="text-cyan-500 hover:text-cyan-400 font-semibold cursor-pointer">
            Browse files
            <input type="file" multiple className="sr-only" onChange={handleFileChange} />
          </label>
        </div>
        {files.length > 0 && (
            <div className="mt-4 flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                {files.map(file => (
                    <div key={file.name} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                        <div className="flex items-center overflow-hidden flex-grow">
                            <FileIcon className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-white truncate" title={file.name}>{file.name}</span>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-2 space-x-2">
                          <div className="relative">
                            <select
                              value={file.language}
                              onChange={(e) => handleLanguageChange(file.name, e.target.value)}
                              className="bg-gray-600 border border-gray-500 rounded-md text-xs py-1 pl-2 pr-6 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none"
                              aria-label={`Language for ${file.name}`}
                            >
                              {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                  {lang.label}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-400">
                              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                          </div>
                          <button onClick={() => removeFile(file.name)} className="p-1 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white flex-shrink-0">
                              <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

export const CodeInput: React.FC<CodeInputProps> = ({
  files,
  setFiles,
  onSubmit,
  isLoading,
  selectedModel,
  onModelChange,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  
  const TabButton: React.FC<{tab: 'upload' | 'paste', children: React.ReactNode}> = ({ tab, children }) => (
      <button 
        onClick={() => {
            setActiveTab(tab);
            setFiles([]); // Clear files when switching tabs
        }}
        className={`px-4 py-2 text-sm font-semibold rounded-t-md focus:outline-none ${activeTab === tab ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-700/80'}`}
      >
        {children}
      </button>
  );

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-white mb-4">Your Code</h2>
      <div className="flex border-b border-gray-700">
          <TabButton tab="upload">Upload Files</TabButton>
          <TabButton tab="paste">Paste Code</TabButton>
      </div>
      <div className="bg-gray-800 pt-4 flex-grow min-h-0">
          {activeTab === 'upload' ? (
              <FileUploadInput files={files} setFiles={setFiles} />
          ) : (
              <PasteCodeInput
                onFileUpdate={(file) => setFiles(file.content ? [file] : [])}
                selectedModel={selectedModel}
              />
          )}
      </div>

      <div className="mt-6">
          <label htmlFor="ai-model-select" className="block text-sm font-medium text-gray-400 mb-2">AI Model</label>
          <select
            id="ai-model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value as AiModel)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {SUPPORTED_MODELS.map((model) => (
              <option key={model.value} value={model.value} disabled={!model.isImplemented}>
                {model.label}
              </option>
            ))}
          </select>
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading || files.length === 0}
        className="mt-4 w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader className="h-5 w-5 mr-2" />
            Reviewing...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5 mr-2" />
            {`Review ${files.length > 0 ? `${files.length} File(s)` : 'Code'}`}
          </>
        )}
      </button>
    </div>
  );
};