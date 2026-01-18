
export enum SceneStatus {
  IDLE = 'IDLE',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface Scene {
  id: string;
  order: number;
  description: string; // The visual description for the model
  narrative: string; // The voiceover or subtitle text
  imageUrl?: string;
  lastFrameImageUrl?: string; 
  lastFrameDescription?: string; 
  videoUrl?: string;
  audioUrl?: string; 
  status: SceneStatus;
  voice?: string; 
  isThumbnail?: boolean;
}

export interface ProjectState {
  topic: string;
  scenes: Scene[];
  isGenerating: boolean;
  currentSceneId: string | null; 
  apiKeyValid: boolean;
  selectedVoice: string;
  projectContext: string; // Global visual guide
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
