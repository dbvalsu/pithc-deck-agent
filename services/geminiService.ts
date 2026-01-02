
import { GoogleGenAI, Type } from "@google/genai";
import { Deck, ChatMessage } from "../types";
import { DECK_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from "../prompts";

export class GeminiService {
  private static readonly MODEL_NAME = 'gemini-3-pro-preview';

  static async generateDeck(prompt: string, history: ChatMessage[] = []): Promise<Deck> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: this.MODEL_NAME,
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: `Architect a world-class business artifact for: ${prompt}. Use sophisticated layouts for web or business planning if requested. Return JSON only.` }] }
      ],
      config: {
        systemInstruction: DECK_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        // Maximum thinking budget for peak structural reasoning
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });

    const text = response.text?.trim() || '{}';
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Deck JSON parsing failed", text);
      throw new Error("I encountered a structural error while architecting your vision. Please refine your strategy and try again.");
    }
  }

  static async chatWithAgent(message: string, history: ChatMessage[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: this.MODEL_NAME,
      config: {
        systemInstruction: CHAT_SYSTEM_PROMPT,
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm ready to refine your vision. Tell me about your business goals.";
  }

  static async editImage(imageDataUrl: string, prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const [mimePart, dataPart] = imageDataUrl.split(';base64,');
    const mimeType = mimePart.split(':')[1];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: dataPart, mimeType: mimeType } },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  }

  static async generateVideo(imageDataUrl: string, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const [mimePart, dataPart] = imageDataUrl.split(';base64,');
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: { imageBytes: dataPart, mimeType: mimePart.split(':')[1] },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
