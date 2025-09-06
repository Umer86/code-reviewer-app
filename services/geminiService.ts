
import { GoogleGenAI, Type } from "@google/genai";
import type { CodeReview } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            description: "The category of feedback. Must be one of: 'Bug', 'Performance', 'Style', 'Best Practice', 'Security'.",
            enum: ['Bug', 'Performance', 'Style', 'Best Practice', 'Security']
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
        required: ["category", "line", "description"]
      }
    }
  },
  required: ["overallSummary", "feedback"]
};


export const getCodeReview = async (code: string, language: string): Promise<CodeReview> => {
  const prompt = `
    As an expert senior software engineer, conduct a thorough code review of the following ${language} code.
    Provide a high-level summary and specific, actionable feedback.
    Categorize each piece of feedback and reference the line number.

    Code to review:
    \`\`\`${language}
    ${code}
    \`\`\`
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const reviewData: CodeReview = JSON.parse(jsonText);
    return reviewData;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('429')) {
       throw new Error("API rate limit exceeded. Please wait a moment and try again.");
    }
    throw new Error("Failed to get code review from AI. The model may have returned an invalid response.");
  }
};