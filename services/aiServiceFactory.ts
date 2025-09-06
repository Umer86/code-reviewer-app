import type { AiModel, ICodeReviewerService } from '../types';
import { geminiService } from './geminiService';
import { claudeService } from './ai/claudeService';
import { chatgptService } from './ai/chatgptService';

const services: Record<AiModel, ICodeReviewerService> = {
  gemini: geminiService,
  claude: claudeService,
  chatgpt: chatgptService,
};

export const getAiService = (model: AiModel): ICodeReviewerService => {
  const service = services[model];
  if (!service) {
    throw new Error(`AI service for model '${model}' not found.`);
  }
  return service;
};