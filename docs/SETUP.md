# Setup Guide

This guide provides detailed instructions for setting up Lumiere.ai for local development and production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Firebase Configuration](#firebase-configuration)
- [Google Cloud API Setup](#google-cloud-api-setup)
- [Google Analytics Setup](#google-analytics-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Check Command |
|----------|-----------------|---------------|
| Node.js | 18.0.0 | `node --version` |
| npm | 9.0.0 | `npm --version` |
| Git | 2.30.0 | `git --version` |

### Required Accounts

1. **Google Cloud Account** with billing enabled
2. **Firebase Account** (uses Google account)
3. **GitHub Account** (for cloning/forking)

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/dlmastery/lumiere.ai.git

# Or clone via SSH
git clone git@github.com:dlmastery/lumiere.ai.git

# Navigate to project directory
cd lumiere.ai
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React 19
- TypeScript 5.8
- Vite 6
- Firebase SDK
- Lucide React icons
- Google GenAI SDK

### Step 3: Create Environment File

```bash
# Copy the example file
cp .env.local.example .env.local

# Or create manually
touch .env.local
```

### Step 4: Configure Environment Variables

Edit `.env.local` with your API keys (see sections below for obtaining keys):

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

### Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Firebase Configuration

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name (e.g., "lumiere-ai-prod")
4. Disable Google Analytics (we'll use GA4 separately)
5. Click **"Create project"**

### Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Click **Google** provider
5. Toggle **Enable**
6. Add your **Project support email**
7. Click **Save**

### Step 3: Add Authorized Domains

1. Still in **Authentication** > **Settings**
2. Go to **Authorized domains**
3. Add your domains:
   - `localhost` (already added by default)
   - Your production domain (e.g., `lumiere.yourdomain.com`)

### Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click **Web** icon (`</>`)
4. Register app with nickname (e.g., "lumiere-web")
5. Copy the configuration values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // → FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // → FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",   // → FIREBASE_PROJECT_ID
};
```

### Step 5: Update Environment Variables

Add to `.env.local`:

```env
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

---

## Google Cloud API Setup

### Step 1: Enable Gemini API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Go to **APIs & Services** > **Library**
4. Search for "Generative Language API"
5. Click **Enable**

### Step 2: Enable Billing

1. Go to **Billing** in Cloud Console
2. Link a billing account to your project
3. This is required for Gemini API access

### Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated key
4. (Recommended) Click **Edit** to restrict the key:
   - **Application restrictions**: HTTP referrers
   - Add your domains (localhost:3000, your-domain.com)
   - **API restrictions**: Generative Language API

### Step 4: Update Environment Variables

Add to `.env.local`:

```env
GEMINI_API_KEY=AIza...
```

---

## Google Analytics Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Click **Admin** (gear icon)
3. Click **Create Property**
4. Enter property name (e.g., "Lumiere.ai")
5. Select your timezone and currency
6. Choose **Web** as platform
7. Enter your website URL and stream name
8. Click **Create stream**

### Step 2: Get Measurement ID

1. After creating the stream, you'll see the **Measurement ID**
2. It starts with `G-` (e.g., `G-ABC123DEF4`)
3. Copy this ID

### Step 3: Update Configuration

1. Add to `.env.local`:

```env
GA_MEASUREMENT_ID=G-ABC123DEF4
```

2. Update `index.html` - replace the placeholder:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
```

---

## Environment Variables

### Complete .env.local Example

```env
# =================================
# LUMIERE.AI ENVIRONMENT VARIABLES
# =================================

# Google Gemini API (Required)
# Get from: https://console.cloud.google.com/apis/credentials
GEMINI_API_KEY=AIzaSyD...

# Firebase Authentication (Required)
# Get from: Firebase Console > Project Settings > Your apps
FIREBASE_API_KEY=AIzaSyB...
FIREBASE_AUTH_DOMAIN=lumiere-ai-prod.firebaseapp.com
FIREBASE_PROJECT_ID=lumiere-ai-prod

# Google Analytics 4 (Optional)
# Get from: Google Analytics > Admin > Data Streams
GA_MEASUREMENT_ID=G-ABC123DEF4
```

### Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `FIREBASE_API_KEY` | Yes | Firebase project API key |
| `FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `GA_MEASUREMENT_ID` | No | Google Analytics 4 measurement ID |

---

## Troubleshooting

### Common Issues

#### "Firebase: Error (auth/configuration-not-found)"

**Cause**: Invalid Firebase configuration

**Solution**:
1. Verify all Firebase env vars are set correctly
2. Check that the Firebase project exists
3. Ensure Google Auth is enabled in Firebase Console

#### "API key not valid" Error

**Cause**: Invalid or restricted Gemini API key

**Solution**:
1. Verify the API key in Google Cloud Console
2. Check if the Generative Language API is enabled
3. If key is restricted, add your domain to allowed referrers

#### "Popup blocked" During Sign-In

**Cause**: Browser blocking Firebase auth popup

**Solution**:
1. Allow popups for localhost/your domain
2. Or handle the error gracefully (app already does this)

#### Build Fails with TypeScript Errors

**Cause**: Type mismatches or missing dependencies

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run type check
npx tsc --noEmit
```

#### Analytics Events Not Appearing

**Cause**: Incorrect measurement ID or ad blockers

**Solution**:
1. Verify GA_MEASUREMENT_ID is correct
2. Disable ad blockers during testing
3. Check Google Analytics Real-time view
4. Events may take 24-48 hours to appear in reports

---

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

#### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login and init
firebase login
firebase init hosting

# Deploy
firebase deploy
```

### Production Checklist

- [ ] All environment variables configured
- [ ] Firebase authorized domains updated
- [ ] API key restrictions set for production domain
- [ ] Google Analytics verified working
- [ ] SSL certificate configured
- [ ] Error monitoring set up (optional)
- [ ] Performance monitoring enabled (optional)

---

## Security Best Practices

### For Production

1. **API Key Security**
   - Use restrictive API key settings
   - Consider implementing a backend proxy
   - Monitor API usage in Google Cloud Console

2. **Firebase Security**
   - Enable App Check for additional protection
   - Review Firebase security rules

3. **Content Security Policy**
   - Add appropriate CSP headers
   - Restrict script sources

4. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor API costs and usage

---

## Getting Help

If you encounter issues not covered here:

1. Check [GitHub Issues](https://github.com/dlmastery/lumiere.ai/issues)
2. Search [Stack Overflow](https://stackoverflow.com) with relevant tags
3. Open a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, browser)
