import type { AiModelOption } from './types';

export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'shell', label: 'Shell/Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' },
];

export const SUPPORTED_MODELS: AiModelOption[] = [
  { value: 'gemini', label: 'Google Gemini', isImplemented: true },
  { value: 'claude', label: 'Anthropic Claude (Coming Soon)', isImplemented: false },
  { value: 'chatgpt', label: 'OpenAI ChatGPT (Coming Soon)', isImplemented: false },
];

// For language auto-detection from file extension
export const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  html: 'html',
  css: 'css',
  sh: 'shell',
  sql: 'sql',
  json: 'json',
  md: 'markdown',
  txt: 'plaintext',
};

export const SUPPORTED_FILE_EXTENSIONS = Object.keys(LANGUAGE_MAP);
export const MAX_FILE_SIZE = 1024 * 1024; // 1MB