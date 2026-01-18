# Architecture Guide

This document provides a comprehensive overview of Lumiere.ai's system architecture, design decisions, and component relationships.

## Table of Contents

- [System Overview](#system-overview)
- [Application Flow](#application-flow)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Service Layer](#service-layer)
- [AI Model Integration](#ai-model-integration)
- [Data Models](#data-models)
- [Security Architecture](#security-architecture)

---

## System Overview

Lumiere.ai is a client-side React application that orchestrates multiple Google AI services to generate video content. The architecture follows a progressive disclosure pattern, guiding users through four distinct phases of video creation.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  HeroView   │→ │ ConceptView │→ │PlanningView │→ │WorkspaceView│    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │               │                │                │              │
│         └───────────────┴────────────────┴────────────────┘              │
│                                   │                                      │
│                           ┌───────┴───────┐                              │
│                           │    App.tsx    │                              │
│                           │ State Manager │                              │
│                           └───────┬───────┘                              │
│                                   │                                      │
│         ┌─────────────────────────┼─────────────────────────┐           │
│         │                         │                         │           │
│  ┌──────┴──────┐          ┌──────┴──────┐          ┌──────┴──────┐    │
│  │   Firebase   │          │   Gemini    │          │  Analytics  │    │
│  │   Config     │          │   Service   │          │   Service   │    │
│  └──────────────┘          └──────────────┘          └──────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Firebase   │  │   Gemini    │  │    Veo     │  │   Google    │    │
│  │    Auth     │  │     API     │  │    API     │  │  Analytics  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Application Flow

### View Progression

The application implements a linear workflow with four distinct views:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           VIEW STATE MACHINE                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ┌─────────┐    generateConcept    ┌─────────┐    generateScript        │
│   │  HERO   │ ─────────────────────▶│ CONCEPT │ ──────────────────┐      │
│   └─────────┘                       └─────────┘                   │      │
│        ▲                                 │                        │      │
│        │                                 │ onBack                 │      │
│        │                                 ▼                        ▼      │
│        │                            ┌─────────┐             ┌─────────┐  │
│        └────────────────────────────│PLANNING │────────────▶│WORKSPACE│  │
│              (logo click)           └─────────┘ startProd   └─────────┘  │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input (Topic + Config)
         │
         ▼
┌─────────────────────┐
│ generateVideoConcept│  ◀── Gemini 3 Flash
└─────────────────────┘
         │
         ▼
    Director's Treatment (400+ words)
         │
         ▼
┌─────────────────────┐
│ generateStoryScript │  ◀── Gemini 3 Pro
└─────────────────────┘
         │
         ▼
    Scene Blueprint (JSON)
    ├── projectContext
    └── scenes[]
         │
         ▼ (per scene)
┌─────────────────────┐
│  generateSceneImage │  ◀── Gemini 3 Pro Image
└─────────────────────┘
         │
         ▼
    Image URL (16:9 1K)
         │
         ▼
┌─────────────────────┐
│  generateSceneVideo │  ◀── Veo 3.1
└─────────────────────┘
         │
         ▼
    Video URL (animated)
         │
         ▼
┌─────────────────────┐
│   generateSpeech    │  ◀── Gemini 2.5 Flash TTS
└─────────────────────┘
         │
         ▼
    Audio URL (voiceover)
```

---

## Component Architecture

### Component Hierarchy

```
App.tsx
├── AuthModal.tsx (when !user)
│
└── (when user)
    ├── Header
    │   ├── Logo
    │   ├── StatusIndicator
    │   └── UserMenu.tsx
    │
    ├── HeroView.tsx
    │   ├── TopicInput
    │   ├── ConfigPanel
    │   │   ├── VoiceSelector
    │   │   ├── StyleSelector
    │   │   ├── AudienceSelector
    │   │   └── SceneCountSlider
    │   └── GenerateButton
    │
    ├── ConceptView.tsx
    │   ├── ConceptEditor
    │   └── ActionButtons
    │
    ├── PlanningView.tsx
    │   ├── SceneList
    │   ├── SceneEditor
    │   ├── RawJSONEditor
    │   └── ChatInterface.tsx
    │
    └── WorkspaceView.tsx
        ├── Timeline.tsx
        │   └── SceneCard[]
        ├── Player.tsx
        │   └── Canvas
        ├── ScenePanel
        │   ├── ImageGenerator
        │   ├── VideoGenerator
        │   └── AudioGenerator
        └── ChatInterface.tsx
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `App.tsx` | Global state, view routing, auth state |
| `AuthModal` | Google Sign-In flow |
| `UserMenu` | User profile, sign out |
| `HeroView` | Initial input, configuration |
| `ConceptView` | Director's treatment editing |
| `PlanningView` | Scene breakdown, JSON editing |
| `WorkspaceView` | Asset generation, preview |
| `Player` | Canvas rendering, export |
| `Timeline` | Scene navigation, status |
| `ChatInterface` | AI-powered refinement |

---

## State Management

### Centralized State in App.tsx

All application state is managed in `App.tsx` using React's `useState` hooks. This approach was chosen for:

- **Simplicity**: No external state library required
- **Predictability**: Single source of truth
- **Performance**: React 19's automatic batching

### State Categories

```typescript
// Authentication State
const [user, setUser] = useState<User | null>(null);
const [authLoading, setAuthLoading] = useState(true);

// View State
const [view, setView] = useState<'hero' | 'concept' | 'planning' | 'workspace'>('hero');

// Content State
const [topic, setTopic] = useState('');
const [concept, setConcept] = useState('');
const [projectContext, setProjectContext] = useState('');
const [scenes, setScenes] = useState<Scene[]>([]);

// Configuration State
const [selectedVoice, setSelectedVoice] = useState('Kore');
const [videoType, setVideoType] = useState('Story/Narrative');
const [targetAudience, setTargetAudience] = useState('General Public');
const [imageStyle, setImageStyle] = useState('Cinematic');

// UI State
const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
const [isChatOpen, setIsChatOpen] = useState(false);
const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
```

### State Update Patterns

```typescript
// Scene updates use functional updates for safety
const updateSceneStatus = (id: string, status: SceneStatus) => {
  setScenes(prev => prev.map(s =>
    s.id === id ? { ...s, status } : s
  ));
};

// Batch updates for multiple scene properties
setScenes(prev => prev.map(s =>
  s.id === scene.id
    ? { ...s, imageUrl, status: s.audioUrl ? SceneStatus.READY : SceneStatus.IDLE }
    : s
));
```

---

## Service Layer

### Service Architecture

```
services/
├── geminiService.ts     # AI API integrations
├── firebaseConfig.ts    # Authentication
└── analyticsService.ts  # Event tracking
```

### geminiService.ts

Central hub for all Google AI interactions:

```typescript
// Model Configuration
const MODELS = {
  conceptGeneration: 'gemini-3-flash-preview',
  scriptGeneration: 'gemini-3-pro-preview',
  imageGeneration: 'gemini-3-pro-image-preview',
  videoGeneration: 'veo-3.1-generate-preview',
  textToSpeech: 'gemini-2.5-flash-preview-tts'
};

// Exported Functions
export async function generateVideoConcept(topic, videoType, audience, style): Promise<string>
export async function generateStoryScript(concept, ...config): Promise<ScriptResult>
export async function generateSceneImage(prompt, style, context): Promise<string>
export async function generateSceneVideo(description, imageUrl, lastFrameUrl): Promise<string>
export async function generateSpeech(text, voice): Promise<string>
export async function refineSceneText(scene, instruction, context): Promise<Scene>
export async function refineProjectWide(scenes, instruction, context): Promise<RefineResult>
```

### firebaseConfig.ts

Firebase authentication wrapper:

```typescript
export const auth: Auth;
export function signInWithGoogle(): Promise<User>;
export function signOut(): Promise<void>;
export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
```

### analyticsService.ts

Google Analytics 4 integration:

```typescript
export function initAnalytics(): void;
export function trackPageView(pageName: string): void;
export function trackEvent(action: string, category: string, label?: string): void;
export function setUserId(uid: string): void;

// Convenience functions
export function trackGenerateConcept(): void;
export function trackGenerateScript(): void;
export function trackGenerateImage(): void;
export function trackGenerateVideo(): void;
export function trackGenerateAudio(): void;
export function trackExportVideo(): void;
```

---

## AI Model Integration

### Model Selection Rationale

| Model | Use Case | Why This Model |
|-------|----------|----------------|
| Gemini 3 Flash | Concept generation | Fast, creative, lower cost |
| Gemini 3 Pro | Script generation | Structured output, JSON schema support |
| Gemini 3 Pro Image | Image generation | High quality, 16:9 aspect ratio |
| Veo 3.1 | Video animation | State-of-the-art video generation |
| Gemini 2.5 Flash TTS | Voice synthesis | Natural voices, low latency |

### Prompt Engineering

#### Concept Generation Prompt Structure

```
SYSTEM: You are a legendary Hollywood director...

USER: Create a Director's Treatment for:
- Topic: {topic}
- Type: {videoType}
- Audience: {targetAudience}
- Style: {imageStyle}

Requirements:
- 400+ words
- Vivid visual descriptions
- Emotional arc
- Specific artistic direction
```

#### Script Generation with JSON Schema

```typescript
const schema = {
  type: "object",
  properties: {
    projectContext: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          narrative: { type: "string" },
          lastFrameDescription: { type: "string" }
        }
      }
    }
  }
};
```

---

## Data Models

### Core Types (types.ts)

```typescript
export enum SceneStatus {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface Scene {
  id: string;
  order: number;
  description: string;           // First frame visual
  lastFrameDescription?: string; // Last frame visual
  narrative: string;             // Voiceover text
  imageUrl?: string;
  lastFrameImageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  status: SceneStatus;
  voice?: string;
  isThumbnail?: boolean;
}

export interface ProjectState {
  topic: string;
  concept: string;
  projectContext: string;
  scenes: Scene[];
  config: ProjectConfig;
}

export interface ProjectConfig {
  videoType: string;
  targetAudience: string;
  imageStyle: string;
  selectedVoice: string;
  sceneCount: number;
}
```

### Scene Lifecycle

```
┌─────────┐   generateImage   ┌──────────────────┐
│  IDLE   │ ────────────────▶ │ GENERATING_IMAGE │
└─────────┘                   └────────┬─────────┘
                                       │
                              success  │  error
                    ┌──────────────────┴───────────────┐
                    │                                  │
                    ▼                                  ▼
             ┌─────────┐                         ┌─────────┐
             │  IDLE   │                         │  ERROR  │
             └────┬────┘                         └─────────┘
                  │
                  │ generateVideo
                  ▼
         ┌──────────────────┐
         │ GENERATING_VIDEO │
         └────────┬─────────┘
                  │
         success  │
                  ▼
             ┌─────────┐
             │  READY  │
             └─────────┘
```

---

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │────▶│ Firebase SDK │────▶│ Google OAuth │
└──────────┘     └──────────────┘     └──────────────┘
                        │
                        │ JWT Token
                        ▼
                 ┌──────────────┐
                 │ onAuthState  │
                 │   Changed    │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  App State   │
                 │  user: User  │
                 └──────────────┘
```

### Security Considerations

1. **API Keys**
   - Stored in `.env.local` (git-ignored)
   - Exposed via Vite's `define` config
   - Client-side only (consider backend proxy for production)

2. **Authentication**
   - Firebase handles token management
   - Session persistence via Firebase
   - Automatic token refresh

3. **Data Privacy**
   - No user data stored on server
   - All generation happens client-side
   - Analytics uses anonymized user IDs

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Generation**
   - Assets generated on-demand
   - Sequential processing prevents API overload

2. **State Batching**
   - React 19's automatic batching
   - Functional state updates

3. **Canvas Rendering**
   - Hardware-accelerated rendering
   - Efficient Ken Burns animations

### Bundle Size

```
dist/index.html        6.29 kB
dist/assets/index.js   687.57 kB (gzip: 166.43 kB)
```

Firebase is the largest dependency. Consider code splitting for production optimization.

---

## Future Architecture Considerations

1. **Backend API Gateway**
   - Secure API key storage
   - Rate limiting
   - Usage tracking

2. **State Management Library**
   - Zustand or Jotai for complex state
   - Better devtools support

3. **Offline Support**
   - Service workers
   - IndexedDB for draft storage

4. **Real-time Collaboration**
   - Firebase Realtime Database
   - Operational transformation
