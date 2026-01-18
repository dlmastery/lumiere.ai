# API Reference

This document provides detailed documentation for all service functions, AI model configurations, and integration points in Lumiere.ai.

## Table of Contents

- [Gemini Service](#gemini-service)
- [Firebase Service](#firebase-service)
- [Analytics Service](#analytics-service)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)

---

## Gemini Service

Location: `services/geminiService.ts`

The Gemini Service handles all interactions with Google's AI models.

### Model Configuration

```typescript
const MODELS = {
  // Fast concept generation
  conceptGeneration: 'gemini-3-flash-preview',

  // Structured script generation with JSON output
  scriptGeneration: 'gemini-3-pro-preview',

  // High-quality image generation (16:9, 1K resolution)
  imageGeneration: 'gemini-3-pro-image-preview',

  // Video animation from images
  videoGeneration: 'veo-3.1-generate-preview',

  // Natural text-to-speech
  textToSpeech: 'gemini-2.5-flash-preview-tts'
};
```

---

### generateVideoConcept

Generates a Director's Treatment from a topic and configuration.

```typescript
function generateVideoConcept(
  topic: string,
  videoType: string,
  targetAudience: string,
  imageStyle: string
): Promise<string>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | `string` | The main topic or theme for the video |
| `videoType` | `string` | Type of video (e.g., "Story/Narrative", "Commercial/Ad") |
| `targetAudience` | `string` | Target audience (e.g., "General Public", "Professionals") |
| `imageStyle` | `string` | Visual style (e.g., "Cinematic", "Anime") |

#### Returns

`Promise<string>` - A 400+ word creative brief describing the video concept.

#### Example

```typescript
const concept = await generateVideoConcept(
  "The future of sustainable cities",
  "Documentary",
  "General Public",
  "Cinematic"
);
```

---

### generateStoryScript

Generates a structured scene breakdown from the concept.

```typescript
function generateStoryScript(
  concept: string,
  videoType: string,
  targetAudience: string,
  imageStyle: string,
  videoLocation: string,
  sceneCount: number,
  useCharacterConsistency: boolean
): Promise<ScriptResult>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `concept` | `string` | The Director's Treatment text |
| `videoType` | `string` | Type of video |
| `targetAudience` | `string` | Target audience |
| `imageStyle` | `string` | Visual style |
| `videoLocation` | `string` | Location setting |
| `sceneCount` | `number` | Number of scenes to generate (1-20) |
| `useCharacterConsistency` | `boolean` | Maintain character appearance across scenes |

#### Returns

```typescript
interface ScriptResult {
  projectContext: string;  // Global visual DNA for consistency
  scenes: Array<{
    id: string;
    order: number;
    description: string;        // First frame visual description
    narrative: string;          // Voiceover text
    lastFrameDescription: string; // Last frame visual description
  }>;
}
```

#### Example

```typescript
const script = await generateStoryScript(
  concept,
  "Documentary",
  "General Public",
  "Cinematic",
  "Dynamic (Auto)",
  8,
  true
);

console.log(script.projectContext);
console.log(script.scenes.length); // 8
```

---

### generateSceneImage

Generates a high-quality image for a scene.

```typescript
function generateSceneImage(
  prompt: string,
  imageStyle: string,
  projectContext: string
): Promise<string>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | `string` | Visual description of the scene |
| `imageStyle` | `string` | Visual style to apply |
| `projectContext` | `string` | Project-wide visual DNA for consistency |

#### Returns

`Promise<string>` - URL or base64 data of the generated image.

#### Image Specifications

- **Aspect Ratio**: 16:9
- **Resolution**: ~1K (1024x576)
- **Format**: PNG/JPEG

#### Example

```typescript
const imageUrl = await generateSceneImage(
  "A sprawling futuristic city with vertical gardens",
  "Cinematic",
  projectContext
);
```

---

### generateSceneVideo

Animates a scene image into a video clip using Veo.

```typescript
function generateSceneVideo(
  description: string,
  imageUrl?: string,
  lastFrameImageUrl?: string
): Promise<string>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `description` | `string` | Motion/animation description |
| `imageUrl` | `string?` | Starting frame image URL |
| `lastFrameImageUrl` | `string?` | Ending frame image URL (for image-to-image) |

#### Returns

`Promise<string>` - URL of the generated video.

#### Video Specifications

- **Duration**: 4-8 seconds (depending on description)
- **Resolution**: 720p-1080p
- **Format**: MP4

#### Example

```typescript
const videoUrl = await generateSceneVideo(
  "Slow dolly forward through the city streets, cars passing",
  scene.imageUrl,
  scene.lastFrameImageUrl
);
```

---

### generateSpeech

Converts text to speech using Gemini TTS.

```typescript
function generateSpeech(
  text: string,
  voice: string
): Promise<string>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | Narrative text to speak |
| `voice` | `string` | Voice name |

#### Available Voices

| Voice | Character Description |
|-------|----------------------|
| `Kore` | Professional, authoritative female voice |
| `Puck` | Playful, energetic voice |
| `Charon` | Deep, dramatic male voice |
| `Fenrir` | Bold, powerful voice |
| `Zephyr` | Calm, soothing voice |

#### Returns

`Promise<string>` - URL or base64 data of the audio file.

#### Audio Specifications

- **Format**: WAV/MP3
- **Sample Rate**: 24kHz
- **Channels**: Mono

#### Example

```typescript
const audioUrl = await generateSpeech(
  "In the year 2050, cities have transformed...",
  "Kore"
);
```

---

### refineSceneText

Refines a single scene based on user instruction.

```typescript
function refineSceneText(
  scene: Scene,
  instruction: string,
  projectContext: string
): Promise<Scene>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `scene` | `Scene` | The scene to refine |
| `instruction` | `string` | Natural language instruction |
| `projectContext` | `string` | Project context for consistency |

#### Returns

`Promise<Scene>` - Updated scene with refined text.

#### Example

```typescript
const updatedScene = await refineSceneText(
  scene,
  "Make the description more dramatic and add rain",
  projectContext
);
```

---

### refineProjectWide

Applies refinements across all scenes.

```typescript
function refineProjectWide(
  scenes: Scene[],
  instruction: string,
  projectContext: string
): Promise<RefineResult>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `scenes` | `Scene[]` | All project scenes |
| `instruction` | `string` | Project-wide instruction |
| `projectContext` | `string` | Current project context |

#### Returns

```typescript
interface RefineResult {
  scenes: Scene[];
  projectContext: string;
}
```

---

### validateScriptData

Validates JSON script data from the raw editor.

```typescript
function validateScriptData(data: unknown): string | null
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `unknown` | Parsed JSON data to validate |

#### Returns

`string | null` - Error message if invalid, `null` if valid.

---

### checkApiKey

Checks if the Gemini API key is valid.

```typescript
function checkApiKey(): Promise<boolean>
```

---

## Firebase Service

Location: `services/firebaseConfig.ts`

Handles Firebase initialization and authentication.

### Configuration

```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
```

---

### signInWithGoogle

Initiates Google Sign-In popup flow.

```typescript
function signInWithGoogle(): Promise<User>
```

#### Returns

`Promise<User>` - Firebase User object on success.

#### Throws

- `auth/popup-blocked` - Browser blocked the popup
- `auth/popup-closed-by-user` - User closed the popup
- `auth/network-request-failed` - Network error

#### Example

```typescript
try {
  const user = await signInWithGoogle();
  console.log('Signed in as:', user.displayName);
} catch (error) {
  if (error.code === 'auth/popup-blocked') {
    // Handle popup blocked
  }
}
```

---

### signOut

Signs out the current user.

```typescript
function signOut(): Promise<void>
```

---

### onAuthStateChanged

Subscribes to authentication state changes.

```typescript
function onAuthStateChanged(
  callback: (user: User | null) => void
): () => void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `function` | Called when auth state changes |

#### Returns

`() => void` - Unsubscribe function.

#### Example

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged((user) => {
    if (user) {
      console.log('User signed in:', user.uid);
    } else {
      console.log('User signed out');
    }
  });

  return () => unsubscribe();
}, []);
```

---

## Analytics Service

Location: `services/analyticsService.ts`

Handles Google Analytics 4 event tracking.

---

### initAnalytics

Initializes Google Analytics.

```typescript
function initAnalytics(): void
```

Call this once when the app loads.

---

### trackPageView

Tracks a page/view navigation.

```typescript
function trackPageView(pageName: string): void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pageName` | `string` | Name of the view (hero, concept, planning, workspace) |

---

### trackEvent

Tracks a custom event.

```typescript
function trackEvent(
  action: string,
  category: string,
  label?: string
): void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | `string` | Event action name |
| `category` | `string` | Event category |
| `label` | `string?` | Optional event label |

---

### setUserId

Associates analytics with an authenticated user.

```typescript
function setUserId(uid: string): void
```

---

### Convenience Functions

```typescript
function trackSignIn(): void
function trackGenerateConcept(): void
function trackGenerateScript(): void
function trackGenerateImage(): void
function trackGenerateVideo(): void
function trackGenerateAudio(): void
function trackExportVideo(): void
```

---

## Type Definitions

Location: `types.ts`

### SceneStatus

```typescript
enum SceneStatus {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  READY = 'READY',
  ERROR = 'ERROR'
}
```

### Scene

```typescript
interface Scene {
  id: string;
  order: number;
  description: string;
  lastFrameDescription?: string;
  narrative: string;
  imageUrl?: string;
  lastFrameImageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  status: SceneStatus;
  voice?: string;
  isThumbnail?: boolean;
}
```

### ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

---

## Error Handling

### API Error Patterns

```typescript
try {
  const result = await generateSceneImage(prompt, style, context);
} catch (error) {
  if (error.message.includes('quota')) {
    // Handle rate limiting
  } else if (error.message.includes('invalid')) {
    // Handle invalid input
  } else {
    // Handle generic error
  }
}
```

### Scene Status Error Handling

```typescript
const handleGenerateImage = async (scene: Scene) => {
  updateSceneStatus(scene.id, SceneStatus.GENERATING_IMAGE);
  try {
    const imageUrl = await generateSceneImage(...);
    setScenes(prev => prev.map(s =>
      s.id === scene.id
        ? { ...s, imageUrl, status: SceneStatus.IDLE }
        : s
    ));
  } catch (error) {
    updateSceneStatus(scene.id, SceneStatus.ERROR);
    console.error('Image generation failed:', error);
  }
};
```

### Authentication Error Handling

```typescript
const handleSignIn = async () => {
  try {
    await signInWithGoogle();
  } catch (err) {
    switch (err.code) {
      case 'auth/popup-blocked':
        setError('Please allow popups');
        break;
      case 'auth/popup-closed-by-user':
        setError('Sign in cancelled');
        break;
      case 'auth/network-request-failed':
        setError('Network error');
        break;
      default:
        setError('Sign in failed');
    }
  }
};
```
