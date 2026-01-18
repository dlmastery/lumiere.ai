# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lumiere.ai is an AI-powered video creation platform that generates cinema-grade videos from text prompts. It uses Google Gemini models for concept/script generation, image creation, and text-to-speech, plus Google Veo for video animation.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Setup

Set the following variables in `.env.local`:

```
GEMINI_API_KEY=your-gemini-api-key

# Firebase Config (for Google Authentication)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id

# Google Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Google Authentication in Firebase Console > Authentication > Sign-in method
3. Add your domain to authorized domains
4. Copy the Firebase config values to `.env.local`

### Google Analytics Setup

1. Create a GA4 property at https://analytics.google.com
2. Get your Measurement ID (starts with `G-`)
3. Add it to `.env.local` as `GA_MEASUREMENT_ID`
4. Update the gtag script in `index.html` with your Measurement ID

## Architecture

### Multi-View Workflow

The app follows a progressive content generation pipeline across 4 views:

1. **HeroView** → User enters topic + configuration (voice, type, audience, style, scene count)
2. **ConceptView** → AI generates a "Director's Treatment" (400+ word creative brief)
3. **PlanningView** → AI generates structured scene blueprint; user can edit JSON directly
4. **WorkspaceView** → Production dashboard for generating images, videos, and audio per scene

### Key Files

- `App.tsx` - Main orchestrator with centralized state management (useState). Controls all views, generation workflows, auth state, and scene lifecycle.
- `services/geminiService.ts` - All Google AI API integrations
- `services/firebaseConfig.ts` - Firebase initialization, auth exports (signInWithGoogle, signOut, onAuthStateChanged)
- `services/analyticsService.ts` - Google Analytics 4 tracking functions
- `components/AuthModal.tsx` - Google Sign-In modal (gates entire app)
- `components/UserMenu.tsx` - User avatar dropdown with sign out
- `types.ts` - TypeScript interfaces (`Scene`, `ProjectState`, `SceneStatus`, `ChatMessage`)

### AI Models Used (in geminiService.ts)

| Model | Purpose |
|-------|---------|
| `gemini-3-flash-preview` | Fast concept generation |
| `gemini-3-pro-preview` | Script generation with JSON schema |
| `gemini-3-pro-image-preview` | 16:9 1K image generation |
| `veo-3.1-generate-preview` | Video animation from images |
| `gemini-2.5-flash-preview-tts` | Text-to-speech (voices: Kore, Puck, Charon, Fenrir, Zephyr) |

### Scene Data Model

Each scene tracks: `description` (start frame visual), `lastFrameDescription` (end frame visual), `narrative` (voiceover text), plus generated `imageUrl`, `lastFrameImageUrl`, `videoUrl`, `audioUrl`, and `status` (IDLE → GENERATING_* → READY/ERROR).

### Authentication Flow

1. User visits app → `onAuthStateChanged` fires
2. If user exists → App renders with UserMenu in header
3. If user null → AuthModal renders with Google Sign-In button
4. User clicks sign in → Firebase `signInWithPopup` → `onAuthStateChanged` fires (user exists)
5. Sign out → Returns to AuthModal

### Generation Flow

1. `generateVideoConcept()` → Director's treatment text
2. `generateStoryScript()` → JSON with `projectContext` (global visual DNA) + scenes array
3. Per scene: `generateSceneImage()` → `generateSceneVideo()` → `generateSpeech()`

The `projectContext` string ensures visual consistency across all generated images.

### Analytics Events Tracked

| Event | Trigger |
|-------|---------|
| `page_view` | View changes (hero, concept, planning, workspace) |
| `sign_in` | User successfully signs in |
| `generate_concept` | User generates video concept |
| `generate_script` | User generates scene script |
| `generate_image` | User generates scene image |
| `generate_video` | User generates scene video |
| `generate_audio` | User generates voiceover |
| `export_video` | User exports final video |

### Player Component

Canvas-based renderer with Ken Burns effect support. Handles image-to-video transitions, audio sync, and video export via MediaRecorder.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (via CDN in index.html)
- Lucide React icons
- `@google/genai` SDK for all AI features
- Firebase Authentication (Google Sign-In)
- Google Analytics 4

## Path Alias

`@/*` maps to project root (configured in vite.config.ts).
