import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ArchitectResult {
  architectureName: string;
  domain: string;
  mapping: Array<{ build: string; role: string; description: string }>;
  gaps: Array<{ feature: string; recommendation: string }>;
  structure: string;
  communication: string;
  systemPrompt: string;
}

export async function generateArchitecture(vision: string, existingBuilds: string): Promise<ArchitectResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `
      You are "The Architect," a world-class software architect and prompt engineer.
      
      Goal Vision: ${vision}
      Existing Builds/Tools: ${existingBuilds}
      
      Analyze the vision and existing builds. Create a unified master specification.
      The approach must be unique to the domain (e.g., if it's a game, use game engine terminology; if it's a fintech app, use banking/security terminology).
      
      Output a JSON object with the following structure:
      {
        "architectureName": "A creative name for this specific architecture",
        "domain": "The identified domain (e.g., E-commerce, Roguelike Game, Data Analytics)",
        "mapping": [
          { "build": "Name of existing build", "role": "Role in the new architecture", "description": "How it fits" }
        ],
        "gaps": [
          { "feature": "Missing piece", "recommendation": "Free-tier implementation suggestion (e.g., Supabase, Firebase, specific API)" }
        ],
        "structure": "A markdown-formatted folder/module structure tree",
        "communication": "Description of how modules interact (APIs, Events, Shared State)",
        "systemPrompt": "A comprehensive, single system prompt ready to paste into Google AI Studio to build this entire application. It should include the full technical spec, coding guidelines, and architectural requirements."
      }
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          architectureName: { type: Type.STRING },
          domain: { type: Type.STRING },
          mapping: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                build: { type: Type.STRING },
                role: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          gaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                recommendation: { type: Type.STRING }
              }
            }
          },
          structure: { type: Type.STRING },
          communication: { type: Type.STRING },
          systemPrompt: { type: Type.STRING }
        },
        required: ["architectureName", "domain", "mapping", "gaps", "structure", "communication", "systemPrompt"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
