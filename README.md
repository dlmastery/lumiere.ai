<p align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Lumiere.ai Banner" width="100%" />
</p>

<h1 align="center">Lumiere.ai</h1>

<p align="center">
  <strong>AI-Powered Cinema-Grade Video Creation Platform</strong>
</p>

<p align="center">
  Transform your ideas into stunning videos using Google Gemini and Veo AI models
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Firebase-12.8-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google" alt="Gemini" />
</p>

---

## Overview

Lumiere.ai is a revolutionary AI video creation platform that empowers creators to produce cinema-quality videos from simple text prompts. By leveraging Google's cutting-edge AI models—Gemini for intelligent content generation and Veo for video synthesis—Lumiere.ai transforms the video production workflow from weeks to minutes.

### Why Lumiere.ai?

- **No Video Editing Skills Required** - Describe your vision in plain English
- **Cinema-Grade Quality** - Professional results powered by state-of-the-art AI
- **Complete Control** - Edit scripts, scenes, and visuals at every step
- **End-to-End Solution** - From concept to final export in one platform

---

## Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **AI Director's Treatment** | Generate comprehensive creative briefs from simple topics |
| **Smart Scene Planning** | Automatic scene breakdown with visual descriptions and narratives |
| **Image Generation** | Create stunning 16:9 1K images in multiple artistic styles |
| **Video Animation** | Transform static images into dynamic video clips with Veo 3.1 |
| **AI Voiceover** | Natural text-to-speech with 5 distinct voice personalities |
| **Ken Burns Effects** | Cinematic camera movements on generated images |
| **Real-time Preview** | Canvas-based player with audio synchronization |
| **Video Export** | Export final compositions via MediaRecorder API |

### Supported Styles

- Cinematic
- Photorealistic
- 3D Animation
- Flat Illustration
- Anime / Manga
- Oil Painting
- Cyberpunk
- Vintage Film
- Watercolor
- Sketch

### Voice Options

| Voice | Character |
|-------|-----------|
| Kore | Professional, authoritative |
| Puck | Playful, energetic |
| Charon | Deep, dramatic |
| Fenrir | Bold, powerful |
| Zephyr | Calm, soothing |

---

## Demo

### Workflow Preview

```
┌─────────────────────────────────────────────────────────────────┐
│                         LUMIERE.AI                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. HERO VIEW          Enter your video topic                   │
│     ─────────────      Select voice, style, audience            │
│                        Configure scene count                     │
│                                    ↓                             │
│  2. CONCEPT VIEW       AI generates Director's Treatment        │
│     ─────────────      400+ word creative brief                 │
│                        Edit and refine vision                    │
│                                    ↓                             │
│  3. PLANNING VIEW      Structured scene blueprint               │
│     ─────────────      JSON-editable scenes                     │
│                        Visual + narrative per scene              │
│                                    ↓                             │
│  4. WORKSPACE VIEW     Generate images per scene                │
│     ─────────────      Generate videos with Veo                 │
│                        Generate voiceovers                       │
│                        Preview and export                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Google Cloud Account** with billing enabled
- **Firebase Project** with Google Authentication enabled
- **Google Analytics 4** property (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/dlmastery/lumiere.ai.git
cd lumiere.ai

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Google Gemini API (Required)
GEMINI_API_KEY=your-gemini-api-key

# Firebase Authentication (Required)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id

# Google Analytics (Optional)
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture Guide](docs/ARCHITECTURE.md) | System design and component structure |
| [Setup Guide](docs/SETUP.md) | Detailed installation and configuration |
| [API Reference](docs/API.md) | Service functions and AI model usage |
| [Contributing](CONTRIBUTING.md) | How to contribute to the project |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with latest features |
| **TypeScript 5.8** | Type-safe development |
| **Vite 6** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Beautiful icon library |

### AI & Backend Services

| Service | Purpose |
|---------|---------|
| **Gemini 3 Flash** | Fast concept generation |
| **Gemini 3 Pro** | Script generation with structured output |
| **Gemini 3 Pro Image** | High-quality image generation |
| **Veo 3.1** | Video animation from images |
| **Gemini 2.5 Flash TTS** | Text-to-speech synthesis |

### Authentication & Analytics

| Service | Purpose |
|---------|---------|
| **Firebase Auth** | Google Sign-In authentication |
| **Google Analytics 4** | User behavior tracking |

---

## Project Structure

```
lumiere.ai/
├── components/           # React components
│   ├── AuthModal.tsx     # Google Sign-In modal
│   ├── UserMenu.tsx      # User avatar dropdown
│   ├── HeroView.tsx      # Landing/input view
│   ├── ConceptView.tsx   # Director's treatment view
│   ├── PlanningView.tsx  # Scene planning view
│   ├── WorkspaceView.tsx # Production dashboard
│   ├── Player.tsx        # Canvas video player
│   ├── Timeline.tsx      # Scene timeline
│   └── ChatInterface.tsx # AI refinement chat
├── services/
│   ├── geminiService.ts    # Google AI integrations
│   ├── firebaseConfig.ts   # Firebase auth setup
│   └── analyticsService.ts # GA4 tracking
├── docs/                 # Documentation
├── App.tsx               # Main application
├── types.ts              # TypeScript interfaces
├── index.html            # HTML entry point
└── vite.config.ts        # Vite configuration
```

---

## Authentication Flow

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  User Visit  │────▶│  Auth Check   │────▶│  Has User?   │
└──────────────┘     └───────────────┘     └──────┬───────┘
                                                   │
                     ┌─────────────────────────────┼─────────────────────────────┐
                     │                             │                             │
                     ▼                             ▼                             │
              ┌─────────────┐              ┌─────────────┐                       │
              │  Show Auth  │              │  Show App   │                       │
              │   Modal     │              │  + UserMenu │                       │
              └──────┬──────┘              └─────────────┘                       │
                     │                                                           │
                     ▼                                                           │
              ┌─────────────┐                                                    │
              │   Google    │                                                    │
              │  Sign-In    │────────────────────────────────────────────────────┘
              └─────────────┘
```

---

## Analytics Events

Lumiere.ai tracks the following events for product analytics:

| Event | Trigger | Category |
|-------|---------|----------|
| `page_view` | View navigation | Navigation |
| `sign_in` | Successful authentication | Auth |
| `generate_concept` | Director's treatment created | Content |
| `generate_script` | Scene blueprint generated | Content |
| `generate_image` | Scene image created | Content |
| `generate_video` | Video clip animated | Content |
| `generate_audio` | Voiceover synthesized | Content |
| `export_video` | Final video exported | Export |

---

## Roadmap

### Upcoming Features

- [ ] Multi-language support
- [ ] Custom voice cloning
- [ ] Batch video processing
- [ ] Team collaboration
- [ ] Template library
- [ ] API access for developers
- [ ] Mobile app (React Native)
- [ ] Advanced video transitions
- [ ] Music/soundtrack generation
- [ ] Social media direct publishing

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Google AI** for Gemini and Veo models
- **Firebase** for authentication infrastructure
- **Tailwind CSS** for the beautiful UI framework
- **Lucide** for the icon library
- **Vite** team for the incredible build tool

---

<p align="center">
  Made with AI by <a href="https://github.com/dlmastery">dlmastery</a>
</p>

<p align="center">
  <a href="https://github.com/dlmastery/lumiere.ai/stargazers">Star this repo</a> •
  <a href="https://github.com/dlmastery/lumiere.ai/issues">Report Bug</a> •
  <a href="https://github.com/dlmastery/lumiere.ai/issues">Request Feature</a>
</p>
