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
    "title": "",
    "subtitle": "",
    "stops": [
      {
        "order": 1,
        "name": "",
        "icon": "",
        "dayLabel": "",
        "stopType": "",
        "driveTimeToNext": ""
      }
    ],
    "summaryTiles": [
      {
        "icon": "",
        "label": "",
        "place": ""
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
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY is not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 20) {
            return NextResponse.json(
                { error: 'Please provide valid trip details (minimum 20 characters)' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.4,
                topP: 0.8,
                responseMimeType: 'application/json',
            },
        });

        const fullPrompt = `${SYSTEM_PROMPT}\n\n---\nTRIP DETAILS FROM AGENT:\n${prompt.trim()}\n---\n\nReturn only the JSON object.`;

        const result = await model.generateContent(fullPrompt);
        const rawText = result.response.text().trim();

        // Strip markdown fences if model adds them despite instruction
        const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        let parsed: any;
        try {
            parsed = JSON.parse(jsonText);
        } catch (parseErr) {
            console.error('[AI Generator] JSON parse failed:', jsonText.slice(0, 400));
            return NextResponse.json(
                { error: 'AI returned malformed JSON. Try refining your input.', raw: jsonText.slice(0, 600) },
                { status: 422 }
            );
        }

        // Basic schema validation
        if (!parsed.hero || !parsed.itinerary || !parsed.journeyMap || !parsed.faq) {
            return NextResponse.json(
                { error: 'AI response missing required sections. Please try again.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ success: true, data: parsed }, { status: 200 });

    } catch (err: any) {
        console.error('[AI Generator] Error:', err.message);
        return NextResponse.json(
            { error: 'AI generation failed', message: err.message },
            { status: 500 }
        );
    }
}
