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
      try {
        res = await chat.sendMessage([
          { functionResponse: { name: call.name, response: { weather: 'Sunny' } } }
        ]);
        console.log("Format 1 worked:", res.text);
      } catch (e) { console.error("Format 1 failed"); }
      
      try {
        const chat2 = ai.chats.create({
            model: 'gemini-3.5-flash',
            config: { tools: [{ functionDeclarations: [{ name: 'getWeather', description: 'Get weather', parameters: { type: 'OBJECT', properties: {} } }] }] }
        });
        await chat2.sendMessage('What is the weather?');
        const res2 = await chat2.sendMessage({
          parts: [{ functionResponse: { name: call.name, response: { weather: 'Sunny' } } }]
        });
        console.log("Format 2 worked:", res2.text);
      } catch (e) { console.error("Format 2 failed"); }
    }
  } catch (e) {
    console.error("Test Error:", e);
  }
})();
