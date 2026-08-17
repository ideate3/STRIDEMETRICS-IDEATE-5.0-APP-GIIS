import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy initializer helper for Gemini client (supports Default App Key or custom user key)
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please enter your personal Gemini API key in settings or sign in.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt builder for Coach
function getJasonSystemPrompt(coachingStyle: string = 'encouraging', profileContext: string = '', coachName: string = 'Jason') {
  let styleGuidance = '';
  switch (coachingStyle) {
    case 'intense':
      styleGuidance = 'Be high-energy, direct, firm, and push the user like an elite athletic trainer. Focus on discipline and maximum effort.';
      break;
    case 'direct':
      styleGuidance = 'Be ultra-concise, zero fluff, straight to the point, data-focused, and practical.';
      break;
    case 'scientific':
      styleGuidance = 'Focus on key scientific mechanisms (hypertrophy, metabolic rate, protein synthesis) in crisp, clear phrasing.';
      break;
    default:
      styleGuidance = 'Be warm, encouraging, motivating, and supportive.';
      break;
  }

  const cleanCoachName = coachName.replace(/^Coach\s+/i, '').trim() || 'Jason';

  return `You are Coach ${cleanCoachName}, an elite AI Health & Fitness Coach.
Your goal is to provide rapid, punchy, expert coaching guidance for physical performance, nutrition, and workout strategy.

CRITICAL INSTRUCTIONS FOR LOW LATENCY & IMPACT:
- Style: ${styleGuidance}
- Keep responses extremely punchy, concise, and direct (2-4 sentences max or short 2-3 item bullet points).
- Avoid lengthy preambles or repetitive filler phrases. Deliver immediate actionable coaching value.
- User Context: ${profileContext || 'No specific profile provided.'}
- Always speak as Coach ${cleanCoachName} in first-person ("I recommend...", "Let's crush this!").`;
}

function extractApiKey(req: express.Request): string | undefined {
  const headerKey = req.headers['x-gemini-api-key'];
  if (typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }
  if (req.body && typeof req.body.customApiKey === 'string' && req.body.customApiKey.trim()) {
    return req.body.customApiKey.trim();
  }
  return undefined;
}

// Generate content helper with model fallback & rate limit resiliency
async function generateContentWithFallback(ai: GoogleGenAI, options: { contents: any; config?: any }) {
  const models = ['gemini-3.6-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const config = { ...options.config };
      if (model !== 'gemini-3.6-flash' && config.thinkingConfig) {
        delete config.thinkingConfig;
      }

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errStr = (err?.message || '') + ' ' + JSON.stringify(err || {});
      const isQuota = err?.status === 429 || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota');
      if (isQuota) {
        console.warn(`[Gemini API] Model ${model} hit quota/rate limit (429). Trying fallback model...`);
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function handleApiError(err: any, res: express.Response, defaultMessage: string) {
  console.error('API Error:', err);
  const errStr = (err?.message || '') + ' ' + JSON.stringify(err || {});
  const isQuota = err?.status === 429 || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota');

  if (isQuota) {
    return res.status(429).json({
      error: 'Free-tier Gemini API quota limit reached. Please wait ~20 seconds before retrying, or enter your personal Gemini API Key in Settings for unlimited requests.',
      isQuotaError: true,
      retryAfterSeconds: 20,
    });
  }

  return res.status(500).json({ error: err?.message || defaultMessage });
}

// 1. Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile, dailyLog } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGeminiClient(extractApiKey(req));
    const style = userProfile?.coachingStyle || 'encouraging';
    const coachName = userProfile?.coachName || 'Jason';
    
    let profileSummary = userProfile ? `Goal: ${userProfile.fitnessGoal}, Weight: ${userProfile.weightKg}kg, Height: ${userProfile.heightCm}cm, Daily Calorie Goal: ${userProfile.dailyCalorieTarget} kcal, Protein: ${userProfile.dailyProteinTargetG}g` : '';
    if (dailyLog) {
      profileSummary += ` | Synced Telemetry Log: Active Mins: ${dailyLog.activeMinutes || 0}, Consumed Kcal: ${dailyLog.caloriesConsumed || 0}, Protein: ${dailyLog.proteinG || 0}g, Water: ${dailyLog.waterMl || 0}ml`;
    }

    const systemInstruction = getJasonSystemPrompt(style, profileSummary, coachName);

    // Format history for Gemini generateContent - take only the last 6 messages to minimize latency
    const recentMessages = messages.slice(-6);
    const formattedContents = recentMessages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await generateContentWithFallback(ai, {
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.6,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    return handleApiError(err, res, 'Failed to generate response');
  }
});

// 2. Meal Analysis API (Vision / Text)
app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { imageBase64, textDescription, mimeType, userProfile } = req.body;
    const ai = getGeminiClient(extractApiKey(req));

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
      parts.push({
        text: 'Analyze this food item/meal photo carefully. Provide accurate nutrition estimates (calories, protein in grams, carbs in grams, fat in grams, fiber if applicable), assign a health score (1-100), key beneficial nutrients, a summary, and Coach Jason\'s actionable coaching feedback.',
      });
    } else if (textDescription) {
      parts.push({
        text: `Analyze this meal description: "${textDescription}". Estimate nutrition details (calories, protein g, carbs g, fat g, fiber g), health score (1-100), key nutrients, summary, and Coach Jason's actionable feedback.`,
      });
    } else {
      return res.status(400).json({ error: 'Image or text description required' });
    }

    const coachName = userProfile?.coachName?.replace(/^Coach\s+/i, '').trim() || 'Jason';
    const response = await generateContentWithFallback(ai, {
      contents: { parts },
      config: {
        systemInstruction: `You are Coach ${coachName} analyzing food intake. Provide objective, precise nutritional breakdowns and personalized coaching advice.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            proteinG: { type: Type.NUMBER },
            carbsG: { type: Type.NUMBER },
            fatG: { type: Type.NUMBER },
            fiberG: { type: Type.NUMBER },
            healthScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            jasonAdvice: { type: Type.STRING },
            keyNutrients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['foodName', 'calories', 'proteinG', 'carbsG', 'fatG', 'healthScore', 'summary', 'jasonAdvice'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    return handleApiError(err, res, 'Failed to analyze meal');
  }
});

// 3. AI Plan Generator API
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { userProfile, focusArea, daysCount } = req.body;
    const ai = getGeminiClient(extractApiKey(req));

    const prompt = `Generate a customized fitness workout routine and nutrition meal plan.
User Profile:
- Goal: ${userProfile?.fitnessGoal || 'muscle_gain'}
- Experience Level: ${userProfile?.activityLevel || 'moderate'}
- Equipment Available: ${userProfile?.equipmentAvailable?.join(', ') || 'Bodyweight'}
- Specific Focus: ${focusArea || 'Full Body'}
- Days per week: ${daysCount || 4}

Provide 1 full featured sample workout session ready for interactive tracking, plus a concise daily nutrition macro strategy and sample daily meal menu.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            durationMinutes: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            category: { type: Type.STRING },
            estimatedCaloriesBurned: { type: Type.NUMBER },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sets: { type: Type.NUMBER },
                  repsOrDuration: { type: Type.STRING },
                  restSeconds: { type: Type.NUMBER },
                  targetMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.STRING },
                  tips: { type: Type.STRING },
                },
                required: ['id', 'name', 'sets', 'repsOrDuration', 'restSeconds', 'targetMuscles', 'instructions'],
              },
            },
            nutritionStrategy: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                recommendedCalories: { type: Type.NUMBER },
                recommendedProteinG: { type: Type.NUMBER },
                recommendedCarbsG: { type: Type.NUMBER },
                recommendedFatG: { type: Type.NUMBER },
                sampleMealIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyTip: { type: Type.STRING },
              },
            },
          },
          required: ['title', 'description', 'durationMinutes', 'difficulty', 'category', 'estimatedCaloriesBurned', 'exercises'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    return handleApiError(err, res, 'Failed to generate plan');
  }
});

// 4. Recommend Weekly Workout Split Endpoint
app.post('/api/recommend-workout', async (req, res) => {
  try {
    const { userProfile, focusArea } = req.body;
    const ai = getGeminiClient(extractApiKey(req));

    const coachName = userProfile?.coachName?.replace(/^Coach\s+/i, '').trim() || 'Jason';
    const prompt = `Generate an optimal 7-day weekly workout split schedule tailored for Coach ${coachName}'s fitness app.
User Profile:
- Goal: ${userProfile?.fitnessGoal || 'muscle_gain'}
- Coaching Style: ${userProfile?.coachingStyle || 'encouraging'}
- Target Weight: ${userProfile?.targetWeightKg || 'N/A'} kg
- Focus: ${focusArea || 'Optimal Weekly Training Split'}

Return a 7-day split covering Monday to Sunday with titles, categories (Strength, HIIT, Cardio, or Recovery), and target focus areas.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklySplit: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  focus: { type: Type.STRING },
                },
                required: ['day', 'title', 'category', 'focus'],
              },
            },
            coachingTip: { type: Type.STRING },
          },
          required: ['weeklySplit'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err: any) {
    return handleApiError(err, res, 'Failed to recommend workout');
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
