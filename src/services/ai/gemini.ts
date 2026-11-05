// ==============================================================================
// YATRA AI - GEMINI AI CLIENT LAYER
// Secure server-side interface to Google Gemini models with graceful fallback
// ==============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.genAI && this.apiKey.trim().length > 0);
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.isAvailable() || !this.genAI) {
      throw new Error('GEMINI_API_KEY is not configured or in DEMO mode.');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction || 'You are YATRA AI, a knowledgeable local travel and mobility assistant for India.',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  public async generateJson<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
    if (!this.isAvailable() || !this.genAI) {
      throw new Error('GEMINI_API_KEY is not configured or in DEMO mode.');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: systemInstruction || 'You are YATRA AI. Respond strictly with valid JSON conforming to the requested schema.',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text) as T;
  }
}

export const geminiService = new GeminiService();

