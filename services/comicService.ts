
import { GoogleGenAI } from "@google/genai";
import { GeneratedComic } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateComicStrip = async (
  topic: string, 
  series: string,
  character: string, 
  context: { unit: string, description: string } | undefined,
  onProgress?: (msg: string) => void
): Promise<Omit<GeneratedComic, 'id' | 'createdAt'>> => {
  const ai = getClient();
  
  // Prepend 'similar to' to avoid copyright issues
  const safeSeries = `similar to ${series}`;
  const safeCharacter = character ? `similar to ${character}` : 'similar to main characters';

  if (onProgress) onProgress("Generating comic strip...");

  const contextStr = context 
  ? `Focus on this specific educational objective: ${context.description} (from Unit: ${context.unit}).`
  : '';

  const prompt = `
    Create a high-quality comic strip about "${topic}" in the visual style of the TV show "${safeSeries}" featuring characters ${safeCharacter}.
    Layout: A single image containing 4 to 6 distinct panels arranged in a grid (comic strip format).
    Content: The characters are explaining the concept of ${topic} in a funny and educational way.
    ${contextStr}
    Style: Detailed, cinematic lighting matching the show, clear comic book styling.
    Text: Include speech bubbles with readable dialogue explaining the topic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9", 
          imageSize: "2K"
        }
      }
    });

    let base64Data = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Data) {
      throw new Error("No image data generated from the model.");
    }

    return {
      type: 'comic',
      topic,
      series,
      character,
      imageUrl: `data:image/png;base64,${base64Data}`
    };

  } catch (error: any) {
    console.error("Comic generation failed:", error);
    throw new Error(error.message || "Failed to generate comic strip.");
  }
}
