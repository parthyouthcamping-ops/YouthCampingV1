const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function discoverModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("GEMINI_API_KEY missing");
        return;
    }

    console.log("Listing available models for key:", key.substring(0, 10));
    
    // Note: The SDK itself doesn't have a direct 'listModels' in the node package sometimes 
    // unless using the REST API directly or specific methods.
    // We'll try to fetch the models list via REST to be absolute.
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            return;
        }
        
        console.log("AVAILABLE MODELS:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("No models returned.");
        }
    } catch (err) {
        console.error("Fetch Exception:", err.message);
    }
}

discoverModels();
