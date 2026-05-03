require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test20() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        await model.generateContent('test');
        console.log('✅ gemini-2.0-flash is working');
    } catch (e) {
        console.log(`❌ gemini-2.0-flash failed: ${e.message}`);
    }
}

test20();
