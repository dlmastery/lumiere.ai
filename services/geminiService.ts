import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Scene, SceneStatus } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API key via the bottom settings or dialog.");
  }
  return new GoogleGenAI({ apiKey });
};

export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return !!process.env.API_KEY;
};

export const promptForKeySelection = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const success = await (window as any).aistudio.openSelectKey();
    return success;
  }
  return false;
};

export interface ScriptResult {
  scenes: Omit<Scene, 'status' | 'imageUrl' | 'videoUrl' | 'audioUrl' | 'lastFrameImageUrl'>[];
  projectContext: string;
}

export const generateVideoConcept = async (
  topic: string, 
  videoType: string, 
  targetAudience: string,
  imageStyle: string
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    As a Senior Creative Director at a world-class film studio, paraphrase the following video request into an expansive "Director's Treatment".
    
    CRITICAL REQUIREMENT: The treatment MUST be at least 400 words long. 
    It should be vivid, evocative, and dive deep into the emotional core, the visual language, and the pacing.
    
    Topic: ${topic}
    Video Type: ${videoType}
    Audience: ${targetAudience}
    Style: ${imageStyle}

    Write it in the first person ("In this video, we will..."). 
    Structure it with sections like "The Vision", "Visual Language", and "Emotional Journey".
    Make it sound like a high-budget pitch that captures the user's intent perfectly.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "Failed to generate concept.";
};

export const validateScriptData = (data: any): string | null => {
  if (typeof data !== 'object' || data === null) return "Input must be a JSON object.";
  if (typeof data.projectContext !== 'string') return "Missing or invalid 'projectContext' string.";
  if (!Array.isArray(data.scenes)) return "Missing or invalid 'scenes' array.";
  
  for (let i = 0; i < data.scenes.length; i++) {
    const s = data.scenes[i];
    if (typeof s.description !== 'string' || s.description.trim().length < 10) {
      return `Scene ${i + 1} has an invalid or too short 'description'.`;
    }
    if (typeof s.narrative !== 'string') {
      return `Scene ${i + 1} is missing a 'narrative' string.`;
    }
    if (typeof s.lastFrameDescription !== 'string') {
       return `Scene ${i + 1} is missing a 'lastFrameDescription' string.`;
    }
  }
  return null;
};

export const generateStoryScript = async (
  concept: string, 
  videoType: string, 
  targetAudience: string,
  imageStyle: string,
  location: string,
  sceneCount: number,
  strongConsistency: boolean = false
): Promise<ScriptResult> => {
  const ai = getAiClient();
  const primaryModel = 'gemini-3-pro-preview'; 
  
  const prompt = `
    ACT AS TWO PERSONAS: A LEAD CREATIVE DIRECTOR AND A RIGOROUS SCRIPT CRITIC.
    
    TASK: Create an ultra-detailed cinematic storyboard based on this REFINED CONCEPT: "${concept}".
    Requested Scene Count: Exactly ${sceneCount} scenes.
    Video Type: "${videoType}"
    Style: "${imageStyle}"
    Setting: "${location}"
    
    PHASE 1: THE DIRECTOR DRAFTS
    - Create EXACTLY ${sceneCount} scenes. No more, no less.
    - Scene 1 MUST be a high-impact Movie Poster / Thumbnail.
    - "projectContext": Define the global visual DNA (lighting rules, character features, color palette).
    - Every scene needs: "description" (start), "narrative" (speech), "lastFrameDescription" (end).
    - CRITICAL: Visual descriptions MUST be vivid essays of 200+ words.
    - CRITICAL: The "narrative" field MUST ONLY contain the spoken words. DO NOT include prefixes like "Voiceover:", "Narrator:", "[Character Name]:", or "Caption:".
    
    PHASE 2: THE CRITIC REVIEWS
    - VERIFY SCENE COUNT: Ensure there are exactly ${sceneCount} scenes. If not, correct it.
    - Ensure STRICT logical and numerical progression (1, 2, 3, 4...). NO SKIPPING.
    - Check for continuity errors.
    - Ensure the narrative makes absolute sense.
    - MANDATORY: Strip ANY "Voiceover:" or "Narrator:" prefixes from the narrative text.
    - Verify that descriptions are consistent with the "projectContext".
    
    PHASE 3: FINAL POLISHED OUTPUT
    - Provide the refined, error-free JSON based on the critique.
    
    Return the result strictly as a JSON object matching the provided schema.
  `;

  const config = {
    responseMimeType: "application/json",
    //@ts-ignore
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        projectContext: { type: Type.STRING },
        scenes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              narrative: { type: Type.STRING },
              lastFrameDescription: { type: Type.STRING }
            },
            required: ['description', 'narrative', 'lastFrameDescription']
          }
        }
      },
      required: ['projectContext', 'scenes']
    }
  };

  const response = await ai.models.generateContent({
    model: primaryModel,
    contents: prompt,
    config
  });

  const result = JSON.parse(response.text || '{}');
  
  return {
    projectContext: result.projectContext || "",
    scenes: (result.scenes || []).map((s: any, index: number) => ({
      id: crypto.randomUUID(),
      order: index,
      description: s.description,
      narrative: s.narrative.replace(/^(Voiceover|Narrator|Narrative|Caption|Speaker|Voice):\s*/i, ""),
      lastFrameDescription: s.lastFrameDescription,
      isThumbnail: index === 0
    }))
  };
};

export const generateSceneImage = async (description: string, style: string = 'Cinematic', projectContext: string = ''): Promise<string> => {
  const ai = getAiClient();
  const primaryModel = 'gemini-3-pro-image-preview';
  
  let styleModifiers = "";
  if (style === 'Cinematic') styleModifiers = "Cinematic lighting, hyper-realistic, 8k, bokeh, anamorphic lens.";
  else if (style === 'Photorealistic') styleModifiers = "Photorealistic, depth of field, natural shadows.";
  else if (style === '3D Animation') styleModifiers = "Subsurface scattering, octane render, high quality textures.";
  else if (style === 'Anime') styleModifiers = "Ufotable style, high-budget digital paint.";
  else if (style === 'Manga') styleModifiers = "Fine hatching, detailed ink textures.";
  else if (style === 'Line Drawing') styleModifiers = "Architectural line work, precise strokes.";
  else styleModifiers = `${style} style.`;

  const enhancedPrompt = `Visual DNA: ${projectContext}. Detailed Scene Description: ${description}. Rendering Style: ${styleModifiers}`;

  const response = await ai.models.generateContent({
    model: primaryModel,
    contents: { parts: [{ text: enhancedPrompt }] },
    config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

export const refineSceneText = async (currentScene: Scene, instruction: string, projectContext: string): Promise<Scene> => {
    const ai = getAiClient();
    const prompt = `Rewrite this scene based on: "${instruction}". 
    MANDATORY: Maintain vividness. Each visual description MUST exceed 200 words.
    CRITIC MODE: Ensure this revision doesn't break the logical flow.
    CRITICAL: The "narrative" field MUST ONLY contain the spoken words. NO "Voiceover:" prefixes.
    Project Visual DNA: ${projectContext}
    Current Start Visual: ${currentScene.description}
    Current Narrative: ${currentScene.narrative}
    Current End Visual: ${currentScene.lastFrameDescription}
    
    Return JSON with updated fields.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            //@ts-ignore
            responseSchema: {
                type: Type.OBJECT,
                properties: { 
                  description: { type: Type.STRING }, 
                  narrative: { type: Type.STRING },
                  lastFrameDescription: { type: Type.STRING }
                },
                required: ['description', 'narrative', 'lastFrameDescription']
            }
        }
    });
    const update = JSON.parse(response.text || '{}');
    if (update.narrative) {
        update.narrative = update.narrative.replace(/^(Voiceover|Narrator|Narrative|Caption|Speaker|Voice):\s*/i, "");
    }
    return { ...currentScene, ...update };
};

export const refineProjectWide = async (scenes: Scene[], instruction: string, projectContext: string): Promise<{ scenes: Scene[], projectContext: string }> => {
    const ai = getAiClient();
    const prompt = `Modify the entire project based on: "${instruction}".
    REQUIRED: All visual descriptions in the array MUST be vividly detailed (200+ words each).
    CRITIC MODE: Review the entire sequence for logical consistency and numerical order. NO BLUNDERS.
    CRITICAL: Strip ANY "Voiceover:" or "Narrator:" prefixes from all narrative fields.
    Current Context: ${projectContext}
    Scenes: ${JSON.stringify(scenes.map(s => ({ order: s.order, desc: s.description, narr: s.narrative })))}
    
    Return updated JSON.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            //@ts-ignore
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    projectContext: { type: Type.STRING },
                    scenes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                narrative: { type: Type.STRING },
                                lastFrameDescription: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });
    
    const result = JSON.parse(response.text || '{}');
    const updatedScenes = scenes.map((s, i) => {
        const updated = result.scenes?.[i] || {};
        if (updated.narrative) {
            updated.narrative = updated.narrative.replace(/^(Voiceover|Narrator|Narrative|Caption|Speaker|Voice):\s*/i, "");
        }
        return {
            ...s,
            ...updated,
            status: SceneStatus.IDLE,
            imageUrl: undefined, audioUrl: undefined, videoUrl: undefined
        };
    });
    
    return { 
        scenes: updatedScenes, 
        projectContext: result.projectContext || projectContext 
    };
};

export const generateSceneVideo = async (description: string, startImageUrl?: string, lastFrameImageUrl?: string): Promise<string> => {
  const primaryModel = 'veo-3.1-generate-preview';
  let startImageBytes: string | undefined;
  let startMimeType: string = 'image/png';
  if (startImageUrl) {
    startImageBytes = startImageUrl.includes('base64,') ? startImageUrl.split('base64,')[1] : startImageUrl;
    const mimeMatch = startImageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    if (mimeMatch) startMimeType = mimeMatch[1];
  }
  let lastImageBytes: string | undefined;
  let lastMimeType: string = 'image/png';
  if (lastFrameImageUrl) {
    lastImageBytes = lastFrameImageUrl.includes('base64,') ? lastFrameImageUrl.split('base64,')[1] : lastFrameImageUrl;
    const mimeMatch = lastFrameImageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    if (mimeMatch) lastMimeType = mimeMatch[1];
  }
  const ai = getAiClient();
  const config: any = { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' };
  if (lastFrameImageUrl && lastImageBytes) {
    config.lastFrame = { imageBytes: lastImageBytes, mimeType: lastMimeType };
  }
  let operation = await ai.models.generateVideos({
    model: primaryModel,
    prompt: description, 
    image: startImageUrl && startImageBytes ? { imageBytes: startImageBytes, mimeType: startMimeType } : undefined,
    config
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: { parts: [{ text: text }] },
    config: {
      responseModalities: [Modality.AUDIO], 
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
    }
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data as string | undefined;
  if (!base64Audio) throw new Error("No audio.");
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return URL.createObjectURL(new Blob([addWavHeader(bytes, 24000, 1)], { type: 'audio/wav' }));
};

function addWavHeader(samples: Uint8Array, sampleRate: number, numChannels: number): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length, true);
  new Uint8Array(buffer, 44).set(samples);
  return new Uint8Array(buffer);
}