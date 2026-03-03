
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
    
    // Detect Quota Exceeded (429) or Permission Denied (403)
    const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("429") || errorStr.includes("resource_exhausted");
    const isPermissionError = errorMessage.includes("permission") || errorMessage.includes("403") || errorMessage.includes("not found");

    if (isQuotaError || isPermissionError) {
      console.warn("Quota or Permission issue detected. Triggering key selection...");
      
      if (window.aistudio) {
        // Platform requirement: Reset and prompt for key on these specific errors
        await window.aistudio.openSelectKey();
        
        if (isQuotaError) {
          return "### ⚠️ Quota Exceeded / কোটা শেষ হয়ে গেছে\n\nYour current API key has reached its usage limit. To continue using WASO's advanced Pro models, please **select an API key from a Paid Google Cloud Project** with billing enabled.\n\nআপনার বর্তমান API কোটা শেষ হয়ে গেছে। WASO-র উন্নত সার্ভিসগুলো ব্যবহার চালিয়ে যেতে একটি **পেইড গুগল ক্লাউড প্রজেক্ট** থেকে API কী সিলেক্ট করুন।\n\n[Learn about Gemini API Billing](https://ai.google.dev/gemini-api/docs/billing)";
        } else {
          return "### 🚫 Permission Denied / অ্যাক্সেস নেই\n\nWASO requires an API key with access to Pro models. Please ensure you have selected a valid key from a project that has the Gemini API enabled and supports high-tier models.\n\nWASO ব্যবহারের জন্য প্রো মডেল সাপোর্ট করে এমন একটি ভ্যালিড API কী প্রয়োজন। অনুগ্রহ করে আপনার প্রজেক্ট সেটিং চেক করুন।";
        }
      }
    }
    
    return "I encountered a neural interrupt while processing your request. Please try again or select a different API key if the issue persists.";
  }

  private async ensureApiKey() {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
  }

  async generateTextResponse(prompt: string, history: { role: string; parts: { text: string }[] }[]) {
    try {
      await this.ensureApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      return response.text;
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
