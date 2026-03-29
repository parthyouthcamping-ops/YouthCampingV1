import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are an expert travel itinerary structurer for a luxury travel company.
Your job is to take raw trip details provided by a travel agent and return ONLY a perfectly structured JSON object — no markdown, no code blocks, no explanations.

STRICT OUTPUT RULES:
- Return only valid JSON matching the schema exactly
- No null values — use empty string "" if unknown
- highlights must be an array of short strings (max 6 per day)
- summaryTiles: one tile per unique experience type found in the route
- driveTimeToNext for the last stop must be ""
- tagline must be emotional and destination-specific, never generic
- Do not add any fields not listed in the schema
- activityType for each day must be one of: "Transfer Day" / "Full Day Explore" / "Wildlife" / "Cultural" / "Adventure" / "Leisure" / "Departure"

JSON SCHEMA TO RETURN:
{
  "hero": {
    "destination": "",
    "clientName": "",
    "duration": "",
    "tripType": "",
    "travelDates": "",
    "groupSize": "",
    "heroImageUrl": "",
    "tagline": ""
  },
  "journeyMap": {
    "summaryTiles": [
      {
        "label": "Distance",
        "value": "120 km",
        "icon": "map"
      },
      {
        "label": "Total Drive",
        "value": "5 hrs",
        "icon": "clock"
      }
    ],
    "stops": [
      {
        "name": "",
        "day": 1,
        "type": "Arrival",
        "icon": "plane",
        "driveTime": "2 hrs"
      }
    ]
  },
  "itinerary": {
    "title": "",
    "days": [
      {
        "dayNumber": 1,
        "title": "",
        "description": "",
        "imageUrl": "",
        "stayType": "",
        "mealType": "",
        "activityType": "",
        "highlights": ["", ""]
      }
    ]
  },
  "faq": {
    "title": "Frequently Asked",
    "items": [
      {
        "question": "",
        "answer": ""
      }
    ]
  }
}`;

export async function POST(request: Request) {
    // ── DEBUG: confirm key is loaded after server restart ──────────────────
    const keyLoaded = process.env.GEMINI_API_KEY;
    console.log('[AI Generator] KEY check:', !!keyLoaded, '| length:', keyLoaded?.length, '| prefix:', keyLoaded?.slice(0, 10));
    // ───────────────────────────────────────────────────────────────────────

    if (!keyLoaded || keyLoaded.includes('your_gemini_api_key')) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY is not configured — please check .env.local and restart your server.' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 20) {
            return NextResponse.json(
                { error: 'Please provide more details in your trip brief.' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(keyLoaded);
        
        // ── ACTUAL MODELS DISCOVERED FOR THIS KEY ──────────────────────────
        // This specific user has access to Gemini 2.0/2.5/3.1
        // Prefixed names are confirmed to be the standard IDs for this key
        const modelsToTry = [
            'models/gemini-2.5-flash',
            'models/gemini-2.0-flash',
            'models/gemini-1.5-flash',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash'
        ];

        
        let lastError = '';
        let resultData = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[AI Generator] Attempting with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const fullPrompt = `${SYSTEM_PROMPT}\n\n---\nTRIP DETAILS FROM AGENT:\n${prompt.trim()}\n---\n\nReturn only the JSON object.`;
                
                const result = await model.generateContent(fullPrompt);
                const response = result.response;
                const text = response.text().trim();
                
                if (text) {
                    resultData = text;
                    console.log(`[AI Generator] Success with model: ${modelName}`);
                    break; 
                }
            } catch (err: any) {
                lastError = err?.message || String(err);
                console.warn(`[AI Generator] Model ${modelName} failed:`, lastError);
                
                // If it's a key issue, stop early
                if (lastError.includes('403') || lastError.includes('401') || lastError.includes('API_KEY_INVALID')) {
                    break; 
                }
            }
        }

        if (!resultData) {
            console.error('[AI Generator] All models failed. Last error:', lastError);
            return NextResponse.json(
                { error: 'AI generation failed.', detail: lastError },
                { status: 500 }
            );
        }

        // Strip markdown fences if present
        const jsonText = resultData.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        let parsed: any;
        try {
            parsed = JSON.parse(jsonText);
        } catch (parseErr) {
            console.error('[AI Generator] JSON parse failed:', jsonText.slice(0, 400));
            return NextResponse.json(
                { error: 'AI returned malformed data. Try refining your brief.', raw: jsonText.slice(0, 400) },
                { status: 422 }
            );
        }

        // Basic schema validation
        if (!parsed.hero || !parsed.itinerary) {
            return NextResponse.json(
                { error: 'AI response was incomplete. Please try again.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ success: true, data: parsed }, { status: 200 });

    } catch (err: any) {
        const detail = err?.message || String(err);
        console.error('[AI Generator] Global error:', detail);
        return NextResponse.json(
            { error: 'Something went wrong with the AI service.', detail },
            { status: 500 }
        );
    }
}


