import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { CodeReview, ICodeReviewerService, IChatSession, CodeFile, BatchCodeReview } from '../types';
import { SUPPORTED_LANGUAGES } from "../constants";

const reviewSchema = {
  type: Type.OBJECT,
  properties: {
    overallSummary: {
      type: Type.STRING,
      description: "A brief, high-level summary of the code quality, highlighting key strengths and areas for improvement."
    },
    feedback: {
      type: Type.ARRAY,
      description: "A list of specific feedback points about the code.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "The category of feedback. Must be one of: 'Bug', 'Performance', 'Style', 'Best Practice', 'Security', 'Maintainability'.",
            enum: ['Bug', 'Performance', 'Style', 'Best Practice', 'Security', 'Maintainability']
          },
          severity: {
            type: Type.STRING,
            description: "The severity of the issue. Must be one of: 'Critical', 'High', 'Medium', 'Low', 'Info'.",
            enum: ['Critical', 'High', 'Medium', 'Low', 'Info']
          },
          line: {
            type: Type.INTEGER,
            description: "The specific line number the feedback pertains to. Use 0 if it's a general comment."
          },
          description: {
            type: Type.STRING,
            description: "A clear and concise explanation of the issue or area for improvement."
          },
          suggestion: {
            type: Type.STRING,
            description: "Optional. A corrected code snippet or a more detailed suggestion for how to fix the issue. Use markdown for code."
          }
        },
        required: ["category", "severity", "line", "description"]
      }
    }
  },
  required: ["overallSummary", "feedback"]
};

class GeminiChatSession implements IChatSession {
  private chat: Chat;

  constructor(chat: Chat) {
    this.chat = chat;
  }

  async sendMessage(message: string): Promise<{ text: string; }> {
    const response = await this.chat.sendMessage({ message });
    return { text: response.text };
  }
}

class GeminiService implements ICodeReviewerService {
  private ai: GoogleGenAI | null = null;

  private getAiInstance(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
          throw new Error("The Gemini AI service has not been configured with an API key. Please contact the administrator.");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }
  
  private async performApiCall(prompt: string, schema: object | null = null): Promise<string> {
    try {
      const ai = this.getAiInstance();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          ...(schema && { 
            responseMimeType: "application/json",
            responseSchema: schema 
          }),
          temperature: 0.2,
        },
      });

      return response.text.trim();
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (error instanceof Error) {
        const lowerCaseError = error.message.toLowerCase();
        if (lowerCaseError.includes('429') || lowerCaseError.includes('rate limit')) {
          throw new Error("API rate limit exceeded. Please wait a moment and try again.");
        }
        if (lowerCaseError.includes('api key not valid') || lowerCaseError.includes('permission denied')) {
          throw new Error("The provided API key is invalid or lacks permissions. Please contact the administrator.");
        }
      }
      throw new Error("Failed to get a response from the AI model. The model may have returned an invalid or empty response.");
    }
  }

  async getCodeReview(code: string, language: string): Promise<CodeReview> {
    const prompt = `
    As an expert senior software engineer and cybersecurity specialist, conduct a comprehensive and meticulous code review of the following ${language} code. Your goal is to identify issues and provide actionable feedback across multiple dimensions.

    **Instructions:**
    1.  **Overall Summary:** Begin with a high-level summary of the code's quality, highlighting its strengths and primary areas for improvement.
    2.  **Detailed Feedback:** Provide a list of specific, actionable feedback points. For each point, you MUST provide:
        *   **Category:** Classify the feedback into one of the following categories: 'Bug', 'Performance', 'Style', 'Best Practice', 'Security', 'Maintainability'.
        *   **Severity:** Assign a severity level: 'Critical', 'High', 'Medium', 'Low', 'Info'.
        *   **Line Number:** The specific line number the feedback pertains to. Use 0 for general, file-wide comments.
        *   **Description:** A clear, concise explanation of the issue.
        *   **Suggestion:** (Optional but highly recommended) A corrected code snippet or a detailed suggestion for improvement. Use markdown for code.

    **Review Checklist (Cover all of these areas):**
    1. Best Practices & Code Quality: Naming Conventions, Code Formatting, Function Complexity, DRY Principle, Comments, Dead Code.
    2. Security Analysis: Injection Vulnerabilities, XSS, Hardcoded Secrets, Insecure Dependencies, Input Validation.
    3. Performance & Optimization: Algorithmic Efficiency, Loop Optimization, Resource Management, Memory Usage.
    4. Maintainability: Modularity, Readability, Testability, Error Handling.

    Code to review:
    \`\`\`${language}
    ${code}
    \`\`\`
    `;

    const jsonText = await this.performApiCall(prompt, reviewSchema);
    const reviewData: CodeReview = JSON.parse(jsonText);
    return reviewData;
  };

  async getBatchSummary(reviews: Record<string, CodeReview>): Promise<string> {
    const summaries = Object.entries(reviews)
      .map(([fileName, review]) => `File: ${fileName}\nSummary: ${review.overallSummary}`)
      .join('\n\n');

    const prompt = `
    As an expert senior software architect, you have received individual code review summaries for multiple files in a project. Your task is to provide a high-level, holistic summary of the entire batch.

    Based on the following individual summaries, identify cross-file patterns, potential architectural issues, recurring anti-patterns, and overall themes. Provide a concise, actionable summary that would help a developer understand the project's health at a higher level.

    Individual Summaries:
    ---
    ${summaries}
    ---

    Provide only the holistic batch summary in your response.
    `;
    
    return this.performApiCall(prompt);
  }
  
  async detectLanguage(code: string): Promise<string | null> {
    if (!code.trim()) return null;

    const languageValues = SUPPORTED_LANGUAGES.map(l => l.value);
    const languageDetectionSchema = {
        type: Type.OBJECT,
        properties: {
            language: {
                type: Type.STRING,
                description: `The detected programming language. Must be one of: ${languageValues.join(', ')}. If unsure, select the most likely candidate.`,
                enum: languageValues,
            }
        },
        required: ["language"]
    };

    const prompt = `
      Analyze the following code snippet and identify its programming language.
      Respond with only the language identifier that best matches the code from the provided list.

      Code to analyze:
      \`\`\`
      ${code.substring(0, 2000)}
      \`\`\`
    `;

    try {
        const jsonText = await this.performApiCall(prompt, languageDetectionSchema);
        const result = JSON.parse(jsonText);
        if (result && result.language && typeof result.language === 'string') {
            return result.language;
        }
    } catch (e) {
        console.error("Failed to parse language detection response:", e);
    }
    return null;
  }


  async startChat(codeFiles: CodeFile[], review: BatchCodeReview): Promise<IChatSession | null> {
    try {
      const ai = this.getAiInstance();
      const codeContext = codeFiles.map(f => `// File: ${f.name}\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n\n');
      const reviewContext = `Overall Summary: ${review.overallSummary}\n\n` +
        Object.entries(review.fileReviews).map(([fileName, fileReview]) => 
          `Feedback for ${fileName}:\n${JSON.stringify(fileReview.feedback, null, 2)}`
        ).join('\n\n');

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are an expert code review assistant. The user has provided code and an initial automated review. Your task is to answer follow-up questions. Use the provided code and review as context. Keep your answers concise and directly related to the user's question.

          **Initial Context:**
          ${codeContext}

          **Initial Review:**
          ${reviewContext}`
        }
      });
      return new GeminiChatSession(chat);
    } catch (e) {
      console.error("Failed to start Gemini chat session:", e);
      return null;
    }
  }
}

export const geminiService = new GeminiService();