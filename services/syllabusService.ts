
import { GoogleGenAI, Type } from "@google/genai";
import { SyllabusData } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string for the API
 */
const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractSyllabus = async (
  input: File | string,
  onProgress?: (msg: string) => void
): Promise<SyllabusData> => {
  const ai = getClient();
  const modelName = 'gemini-2.5-flash'; // Flash is fast and good at extraction

  if (onProgress) onProgress("Analyzing syllabus content...");

  const systemInstruction = `
    You are an expert curriculum developer. 
    Analyze the provided content (which may be a PDF, image, or text) and extract a structured syllabus.
    1. Identify the main Course Title.
    2. Group content into logical Units or Chapters.
    3. Extract atomic Learning Concepts for each unit.
    
    Return a JSON object with:
    - title: string (Course name)
    - units: string[] (List of unit names)
    - concepts: Array of objects { id: string (unique), title: string, description: string (brief), unit: string (must match one of the units) }
  `;

  let parts: any[] = [];

  if (typeof input === 'string') {
    // Raw text input
    parts = [{ text: input }];
  } else {
    // File input (PDF, Image, etc.)
    const filePart = await fileToPart(input);
    parts = [filePart, { text: "Extract the syllabus from this document." }];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            units: { type: Type.ARRAY, items: { type: Type.STRING } },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  unit: { type: Type.STRING }
                },
                required: ["id", "title", "unit"]
              }
            }
          },
          required: ["title", "units", "concepts"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from model");

    const data = JSON.parse(text) as SyllabusData;
    
    // Fallback ID generation if model fails to provide unique ones
    data.concepts = data.concepts.map((c, idx) => ({
        ...c,
        id: c.id || `concept-${idx}`
    }));

    return data;

  } catch (error: any) {
    console.error("Syllabus extraction failed:", error);
    throw new Error("Failed to parse syllabus. Please try again with a clearer file or text.");
  }
};
