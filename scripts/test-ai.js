const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("GEMINI_API_KEY not found in .env.local");
        return;
    }

    console.log("Testing with key starting with:", key.substring(0, 10));
    const genAI = new GoogleGenerativeAI(key);

    try {
        // Standard models to check
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        
        for (const m of models) {
            try {
                console.log(`Checking model: ${m}...`);
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("test");
                console.log(`  SUCCESS: ${m} is working!`);
                process.exit(0);
            } catch (e) {
                console.log(`  FAILED: ${m} - ${e.message}`);
            }
        }
        
    } catch (err) {
        console.error("Global error:", err.message);
    }
}

listModels();
