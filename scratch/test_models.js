require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK doesn't have a direct listModels, we have to use the fetch API or just guess.
        // Let's try a few common ones.
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent('test');
                console.log(`✅ ${m} is working`);
                return;
            } catch (e) {
                console.log(`❌ ${m} failed: ${e.message}`);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

listModels();
