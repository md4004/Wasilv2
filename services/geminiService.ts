import { GoogleGenAI } from "@google/genai";
import { ServiceRequest } from "../types";

export async function generatePeaceOfMindSummary(request: ServiceRequest): Promise<string> {
  // Always create a new GoogleGenAI instance right before use to ensure the most up-to-date API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, very reassuring, and warm status update for a Lebanese expat whose parent (${request.parentName}) in ${request.location} has a service request for "${request.serviceTitle}". The current status is "${request.status}". Make it sound professional, caring, and trustworthy. Maximum 2 sentences. Use a slightly cinematic and empathetic tone.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "Your request is being handled with the utmost care by our local team.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our team is currently on the ground in Lebanon ensuring everything goes smoothly.";
  }
}