
import { GoogleGenAI, Type, GenerateContentResponse, Modality, LiveServerMessage, Blob } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are WASO (Wasin AI Responsive Virtual Intelligence), also known as WARVI.
Created by Wasin.
Persona: Senior Software Architect & Lead Developer.
Expertise: Deep knowledge in ALL programming languages, system design, AI, and professional high-fidelity image synthesis.

BEHAVIOR:
- Thinking & Analyzing: Provide highly optimized, clean, and professional solutions.
- Visual Mastery: You are an expert at generating high-quality still images. When a user asks for an image, you act as a Creative Director, synthesizing professional-grade visuals.
- Bilingual: Expertly handle Bengali and English.
- Personality: Authoritative, wise, yet helpful and fast.

GREETING:
On the very first interaction: "Hey, I am WASO. Wasin created me. I am ready to assist you with elite engineering, analysis, and premium visual generation."
`;

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export class GeminiService {
  constructor() {}

  private async handleApiError(error: any): Promise<string> {
    console.error("Gemini API Error details:", error);
    const errorStr = JSON.stringify(error).toLowerCase();
    const errorMessage = (error?.message || String(error)).toLowerCase();
    
    // Check if API key is missing or invalid
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY' || apiKey.trim() === '') {
      if (typeof window !== 'undefined' && window.aistudio) {
        try { await window.aistudio.openSelectKey(); } catch (e) {}
      }
      return "### 🔑 API Key Missing / API কী প্রয়োজন\n\nNo valid Gemini API key found. Please set your `GEMINI_API_KEY` or select a key from AI Studio.\n\nWASO ব্যবহারের জন্য আপনার Gemini API Key প্রদান করুন।";
    }

    // Detect Quota Exceeded (429) or Permission Denied (403)
    const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("429") || errorStr.includes("resource_exhausted");
    const isPermissionError = errorMessage.includes("permission") || errorMessage.includes("403") || errorMessage.includes("not found");

    if (isQuotaError || isPermissionError) {
      console.warn("Quota or Permission issue detected.");
      
      if (typeof window !== 'undefined' && window.aistudio) {
        try {
          await window.aistudio.openSelectKey();
        } catch (e) {
          console.warn("Could not trigger AI Studio key selector", e);
        }
      }

      if (isQuotaError) {
        return "### ⚠️ Quota Exceeded / কোটা শেষ হয়ে গেছে\n\nYour API key has reached its request quota limit. Please wait a minute or select/provide a Gemini API key from a project with available quota.\n\nআপনার Gemini API Key-এর ফ্রি রিকোয়েস্ট কোটা শেষ হয়ে গেছে। কিছুক্ষণ পর আবার চেষ্টা করুন অথবা একটি নতুন API Key ব্যবহার করুন।\n\n[Learn about Gemini API Quotas](https://ai.google.dev/gemini-api/docs/rate-limits)";
      } else {
        return "### 🚫 Permission Denied / অ্যাক্সেস নেই\n\nYour API key does not have permission for this Gemini model. Please select a valid Gemini API key.\n\nআপনার API Key-তে এই মডেলটির অ্যাক্সেস নেই। অনুগ্রহ করে একটি ভ্যালিড API Key প্রদান করুন।";
      }
    }
    
    return `### ⚠️ WASO Neural Interrupt / সিস্টেম সংযোগ বিচ্ছিন্ন\n\nError: ${error?.message || "Unable to process request"}\n\nPlease check your internet connection or verify your Gemini API key settings.`;
  }

  private async ensureApiKey() {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      } catch (e) {
        console.warn("AI Studio key check skipped/failed:", e);
      }
    }
  }

  async generateTextResponse(prompt: string, history: { role: string; parts: { text: string }[] }[]) {
    try {
      await this.ensureApiKey();
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        return await this.handleApiError(new Error("API key missing"));
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // Primary ultra-fast & reliable model for chat: gemini-2.5-flash
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });
        return response.text;
      } catch (primaryError: any) {
        console.warn("Primary model (gemini-2.5-flash) failed, attempting fallback to gemini-3-flash-preview...", primaryError);
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });
        return response.text;
      }
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  async generateImage(prompt: string): Promise<{ url?: string; error?: string }> {
    try {
      await this.ensureApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const enhancedPrompt = `A professional, high-end masterpiece, 8k resolution, cinematic lighting, ultra-detailed texture, masterpiece composition, photography by professional gear: ${prompt}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: enhancedPrompt }]
        },
        config: {
          imageConfig: { 
            aspectRatio: "1:1", 
            imageSize: "1K" 
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return { url: `data:image/png;base64,${part.inlineData.data}` };
          }
        }
      }
      return { error: "Synthesis produced no visual output." };
    } catch (error) {
      const errorMsg = await this.handleApiError(error);
      return { error: errorMsg };
    }
  }

  async processMultimodal(text: string, base64Data: string, mimeType: string) {
    try {
      await this.ensureApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: text || "Please analyze this file." }
            ]
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });
        return response.text;
      } catch (primaryError: any) {
        console.warn("Primary multimodal model failed, falling back to gemini-2.5-flash...", primaryError);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: text || "Please analyze this file." }
            ]
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });
        return response.text;
      }
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  async tts(text: string): Promise<string | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' } 
            }
          }
        }
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  }

  connectLive(callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
  }) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
}

export const gemini = new GeminiService();

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
