# Fitness & Health App Setup Guide

Welcome to the **Fitness & Health Application** codebase! This comprehensive web application offers AI-powered workout planning, meal analysis, real-time coaching, interactive health calculators, and workout tracking.

---

## 🔒 Important Security Notice: Exported API Keys

> **"does it come with the API keys?"**
> **No.** When you or download this application from or GitHub, **private API keys and secrets (such as `GEMINI_API_KEY`) are deliberately omitted for security reasons**. 

Platform environment secrets are stored securely in the Cloud environment and are never embedded in the exported source code or committed to public version control. Before running the application locally or deploying it on your own server, you must provide your own Gemini API key in a local `.env` file.

---

## 🚀 Quick Start Guide

Follow these steps to run the application on your local machine:

### 1. Prerequisites
- **Node.js**: Version `18.x` or higher (Node 20+ recommended).
- **npm** (included with Node.js) or **bun** / **yarn**.
- A **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation
Extract your downloaded ZIP file or clone the repository, then navigate to the project directory:

```bash
cd your-exported-app-folder
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory of the project (you can copy `.env.example` as a template):

```bash
cp .env.example .env
```

Open `.env` in your code editor and set your credentials:

```env
# Required: Google Gemini API Key for AI features (Coach, Meal Scanner, Workout Generator)
GEMINI_API_KEY="AIzaSyYourActualGeminiApiKeyHere"

# Optional: Set the application URL (defaults to http://localhost:3000)
APP_URL="http://localhost:3000"
```

### 4. Running in Development Mode
Start the full-stack development server (Express server + Vite frontend):

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### 5. Production Build & Execution
To build and run the production-optimized application:

```bash
# Compile the Vite client app and bundle the Express backend
npm run build

# Launch the production server
npm start
```

---

## ✨ Features Overview

1. **AI Coach Chat (`CoachChat.tsx`)**
   - Personal fitness and nutrition assistant powered by Gemini AI.
   - Pre-built quick prompts for quick advice, macro calculations, and form tips.
   - Conversational memory and contextual responses tailored to user goals.

2. **AI Meal Scanner (`MealScanner.tsx`)**
   - Upload or capture photos of meals for instant AI nutrition analysis.
   - Automated calorie and macro breakdown (Protein, Carbs, Fats, Fiber).
   - Health rating, healthy swap suggestions, and log integration.

3. **Workout Planner & AI Routine Generator (`WorkoutPlanner.tsx`)**
   - Generate personalized workout plans tailored to equipment, fitness level, and target muscle groups.
   - Custom routine creation with set, rep, and weight configurations.
   - Interactive muscle silhouette highlighting active target muscles.

4. **Active Workout Logger (`ActiveWorkoutModal.tsx`)**
   - Live workout session timer with rest period countdowns and audio chimes.
   - Track completed sets, total weight volume, and intensity.

5. **Calculators Hub (`CalculatorsHub.tsx`)**
   - Comprehensive suite of health & fitness calculators:
     - **1RM (One Rep Max)**: Calculate maximum strength estimations.
     - **TDEE & BMR**: Estimate daily energy expenditure and basal metabolic rate.
     - **Macro Split Calculator**: Personalize macronutrient targets.
     - **Body Fat % Calculator**: Navy formula-based body composition estimation.
     - **Target Heart Rate (THR)**: Cardio training zones.
     - **Hydration Calculator**: Daily fluid requirements.

6. **Device Integrations Hub (`DeviceIntegrationsModal.tsx`)**
   - Connect and sync simulated fitness wearables (Apple Health, Garmin, Fitbit, WHOOP, Strava).

7. **User Profiles & Authentication (`AuthModal.tsx`, `UserProfileModal.tsx`)**
   - User profile settings, fitness goal targets, and cloud data synchronization via Firebase Firestore.

---

## 🛠️ API Routes & Backend Architecture

The application uses an Express server (`server.ts`) running on port `3000` that handles all API requests and keeps sensitive keys server-side:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check endpoint returning server status. |
| `/api/chat` | `POST` | Proxies user messages to Gemini AI for personal coach responses. |
| `/api/scan-meal` | `POST` | Analyzes uploaded meal image binary/base64 using Gemini Multimodal Vision API. |
| `/api/generate-workout` | `POST` | Generates structured JSON workout routines based on user constraints. |

All static client assets and Vite middleware are served through this central Express entry point.

---

## 🚢 Deployment Suggestions

- **Cloud Run / Docker**: Use the provided Docker/Node setup or deploy directly using Google Cloud Run.
- **Render / Railway**: Connect your GitHub repository, set `GEMINI_API_KEY` in environment variables, set build command to `npm run build`, and start command to `npm start`.
- **Vercel / Netlify**: Configure Node.js environment variables in the project dashboard.

---

## 📄 License
This application is created with Google AI Studio. You are free to customize, modify, and deploy it for your personal or commercial use.
