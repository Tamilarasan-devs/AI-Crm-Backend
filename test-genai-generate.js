require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env['GEMINI-API'] });

(async () => {
  try {
    let res = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'What is the weather?',
      config: {
        tools: [{
          functionDeclarations: [{
            name: 'getWeather',
            description: 'Get weather',
            parameters: { type: 'OBJECT', properties: { location: { type: 'STRING' } } }
          }]
        }]
      }
    });

    console.log("Called functions:", res.functionCalls);
    if (res.functionCalls && res.functionCalls.length > 0) {
      const call = res.functionCalls[0];
      const res2 = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          { role: 'user', parts: [{ text: 'What is the weather?' }] },
          { role: 'model', parts: [{ functionCall: call }] },
          { role: 'user', parts: [{ functionResponse: { name: call.name, response: { weather: 'Sunny' } } }] }
        ],
        config: {
          tools: [{
            functionDeclarations: [{
              name: 'getWeather',
              description: 'Get weather',
              parameters: { type: 'OBJECT', properties: { location: { type: 'STRING' } } }
            }]
          }]
        }
      });
      console.log("Final response:", res2.text);
    }
  } catch (e) {
    console.error("Test Error:", e);
  }
})();
