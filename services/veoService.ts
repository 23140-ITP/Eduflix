
import { GoogleGenAI, Type } from "@google/genai";
import { VideoRequest, TargetDuration } from "../types";

// Helper to ensure we get a fresh client with the potentially updated key
const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Map duration selection to number of 8s segments
const getSegmentCount = (duration: TargetDuration): number => {
  if (duration.includes('30s')) return 4; // ~32s
  if (duration.includes('60s')) return 8; // ~64s
  if (duration.includes('90s')) return 12; // ~96s
  return 3; // Default fallback (24s)
};

// Retry helper with exponential backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOperation<T>(operation: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      // Retry on 429 (Resource Exhausted) or 503 (Service Unavailable)
      const isRetryable = error.status === 429 || error.code === 429 || error.status === 503;
      if (!isRetryable || i === retries - 1) {
        throw error;
      }
      console.warn(`Attempt ${i + 1} failed with ${error.status || error.code}. Retrying in ${delay}ms...`);
      await wait(delay);
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error("Operation failed after retries");
}

// 1. Generate the N-part script using Flash
const generateStoryboard = async (request: VideoRequest, count: number): Promise<string[]> => {
  const ai = getClient();
  const { topic, series, character, difficulty, context } = request;
  
  // Prepend 'similar to' to avoid copyright issues
  const safeSeries = `similar to ${series}`;
  const safeCharacter = character ? `similar to ${character}` : 'similar to main characters';
  
  // Construct context string
  const contextStr = context 
    ? `Specific Concept: ${context.description} (Unit: ${context.unit})`
    : '';

  const systemPrompt = `You are a creative director for educational videos. 
  Split the explanation of the TOPIC into ${count} distinct sequential scenes (Intro, followed by ${count-2} Explanation steps, then Conclusion).
  Style: ${safeSeries} featuring characters ${safeCharacter}. Difficulty: ${difficulty}.
  ${contextStr ? `IMPORTANT: Focus strictly on this syllabus context: ${contextStr}` : ''}
  Each prompt must be a visual description for a video generator, focusing on the character's actions and the setting.
  Output strictly a JSON Array of strings.`;

  const userPrompt = `Create ${count} video prompts for topic: "${topic}".
  
  Format:
  ["Visual description of scene 1...", "Visual description of scene 2...", ...]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, count);
    }
    throw new Error("Invalid JSON format");
  } catch (e) {
    console.error("Script generation failed, falling back to simple split", e);
    // Fallback generation
    return Array(count).fill(0).map((_, i) => 
      `A character (${safeCharacter}) in the style of ${safeSeries} explaining part ${i+1} of ${topic}`
    );
  }
};

export const generateVeoVideo = async (
  request: VideoRequest, 
  onProgress?: (msg: string) => void
): Promise<string> => {
  const ai = getClient();
  const { aspectRatio, duration } = request;
  
  const segmentCount = getSegmentCount(duration);

  // Step 1: Scripting
  if (onProgress) onProgress("Writing the storyboard...");
  const prompts = await generateStoryboard(request, segmentCount);
  
  // Ensure we have enough prompts
  if (prompts.length < segmentCount) {
     const safeSeries = `similar to ${request.series}`;
     while(prompts.length < segmentCount) {
       prompts.push(`Continuing explanation of ${request.topic} in style of ${safeSeries}`);
     }
  }

  let lastOperationResponse: any = null;
  let currentVideoHandle: any = null;

  // Step 2: Generation Loop
  const modelName = 'veo-3.1-fast-generate-preview'; 
  const resolution = '720p';

  for (let i = 0; i < segmentCount; i++) {
    const isExtension = i > 0;
    const currentPrompt = prompts[i];
    const progressMsg = isExtension ? `Extending Scene ${i + 1}/${segmentCount}...` : `Filming Scene 1/${segmentCount}...`;
      
    if (onProgress) onProgress(progressMsg);
    
    console.log(`Starting generation step ${i + 1}/${segmentCount}: ${currentPrompt}`);

    try {
      if (isExtension) await wait(5000); 

      const performGeneration = async () => {
        let op;
        if (!isExtension) {
          op = await ai.models.generateVideos({
            model: modelName,
            prompt: currentPrompt,
            config: { numberOfVideos: 1, resolution, aspectRatio }
          });
        } else {
          if (!currentVideoHandle) throw new Error("Previous video handle lost");
          op = await ai.models.generateVideos({
            model: modelName,
            prompt: currentPrompt,
            video: currentVideoHandle,
            config: { numberOfVideos: 1, resolution, aspectRatio }
          });
        }
        return op;
      };

      let operation = await retryOperation(performGeneration);

      while (!operation.done) {
        await wait(5000);
        operation = await retryOperation(async () => {
             return await ai.operations.getVideosOperation({ operation: operation });
        });
      }

      if (operation.error) throw new Error(`Step ${i+1} failed: ${operation.error.message}`);

      const generatedVideos = operation.response?.generatedVideos;
      if (!generatedVideos || generatedVideos.length === 0) throw new Error("No videos returned.");

      lastOperationResponse = generatedVideos[0];
      currentVideoHandle = lastOperationResponse.video;

    } catch (error: any) {
      console.error(`Error in step ${i + 1}:`, error);
      if (i === 0) throw error;
      console.warn("Stopping generation early due to error, returning partial video.");
      if (onProgress) onProgress("Complexity limit reached. Finalizing partial video...");
      break; 
    }
  }

  // Step 3: Download Final Result
  if (onProgress) onProgress("Finalizing and downloading...");
  
  const videoUri = lastOperationResponse?.video?.uri;
  if (!videoUri) throw new Error("No video URI returned.");

  const downloadUrl = `${videoUri}&key=${process.env.API_KEY}`;
  
  let response;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
        response = await fetch(downloadUrl);
        if (response.ok) break;
    } catch (e) { console.warn("Fetch attempt failed", e); }
    await wait(2000 * (attempt + 1));
  }

  if (!response || !response.ok) throw new Error(`Failed to download video content.`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
