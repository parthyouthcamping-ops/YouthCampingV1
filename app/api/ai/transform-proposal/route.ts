import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a backend data transformer.
Your job is to map an AI-generated travel itinerary JSON into an EXISTING quotation form structure.

IMPORTANT:
- Do NOT create a new format
- Use ONLY the provided form schema
- Fill every field correctly
- Keep keys EXACTLY the same
- Output ONLY valid JSON
- No explanation

EXISTING FORM SCHEMA (Target):
{
  "clientName": "string",
  "destination": "string",
  "pax": "number (default 2)",
  "travelDates": { "from": "ISO Date (YYYY-MM-DD)", "to": "ISO Date (YYYY-MM-DD)" },
  "duration": "string (e.g. 4 Nights / 5 Days)",
  "lowLevelPrice": "number (estimate realistically if missing, e.g. 15000-30000 per pax)",
  "highLevelPrice": "number (estimate realistically if missing, e.g. 40000-60000 per pax)",
  "itinerary": [
    {
      "day": "number",
      "title": "string",
      "description": "string (professional summary)",
      "activities": ["string array of highlights"],
      "meals": "string (e.g. Breakfast & Dinner)",
      "stay": "string (e.g. 5-star Resort)"
    }
  ],
  "lowLevelHotels": [
    { "name": "string", "location": "string", "roomType": "string", "rating": 3 }
  ],
  "highLevelHotels": [
    { "name": "string", "location": "string", "roomType": "string", "rating": 5 }
  ],
  "includes": ["string array"],
  "exclusions": ["string array"],
  "journeyMap": {
    "summaryTiles": [
      { "label": "Distance", "value": "250 km", "icon": "map" },
      { "label": "Drive Time", "value": "8 hrs", "icon": "clock" }
    ],
    "stops": [
      { "name": "Cochin", "day": 1, "type": "Arrival", "icon": "plane", "driveTime": "3 hrs" }
    ]
  },
  "expert": { "name": "string", "whatsapp": "string", "designation": "Destination Expert" }
}

MAPPING RULES:
- Map hero.destination -> destination
- Map hero.groupSize -> pax (integer)
- Map hero.duration -> duration
- Map itinerary.days -> itinerary array
- Map itinerary.days.highlights -> activities
- Map itinerary.days.stayType -> stay
- Map journeyMap -> journeyMap (Pass through or map summaryTiles and stops)
- Map faq -> includes/exclusions/importantNotes (smart distribution)
- If travelDates are "22 Mar - 26 Mar 2026", convert to ISO "2026-03-22" and "2026-03-26".

FINAL OUTPUT:
Return ONLY the mapped JSON matching EXACTLY the given schema.`;

export async function POST(request: Request) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    try {
        const { itineraryJson } = await request.json();
        if (!itineraryJson) return NextResponse.json({ error: "No itinerary data provided" }, { status: 400 });

        const genAI = new GoogleGenerativeAI(key);
        // Using the discovered confirmed model
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const prompt = `${SYSTEM_PROMPT}\n\nINPUT ITINERARY JSON:\n${JSON.stringify(itineraryJson)}\n\nReturn only the mapped JSON.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

        try {
            const parsed = JSON.parse(text);
            return NextResponse.json({ success: true, data: parsed });
        } catch (parseErr) {
            console.error("[Transform API] JSON parse error:", text.slice(0, 500));
            return NextResponse.json({ error: "AI returned invalid JSON structure", raw: text.slice(0, 500) }, { status: 422 });
        }
    } catch (err: any) {
        console.error("[Transform API] Global error:", err.message);
        return NextResponse.json({ error: "Transformation failed", detail: err.message }, { status: 500 });
    }
}
