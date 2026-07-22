require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env['GEMINI-API'] });

(async () => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        tools: [{
          functionDeclarations: [{
            name: 'getWeather',
            description: 'Get weather',
            parameters: { type: 'OBJECT', properties: {} }
          }]
        }]
      }
    });

    let res = await chat.sendMessage('What is the weather?');
    console.log("Called functions:", res.functionCalls);

    if (res.functionCalls && res.functionCalls.length > 0) {
      const call = res.functionCalls[0];
      // Try sending response
      res = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: { weather: 'Sunny and 85 degrees' }
        }
      }]);
      console.log("Final response:", res.text);
    }
  } catch (e) {
    console.error("Test Error:", e);
  }
})();
