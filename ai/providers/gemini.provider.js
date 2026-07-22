const { GoogleGenAI } = require('@google/genai');
const { getAllToolSchemas, executeTool } = require('../services/toolExecutor.service');

const ai = new GoogleGenAI({ apiKey: process.env['GEMINI-API'] });

const SYSTEM_PROMPT = `
You are an enterprise CRM AI assistant.
You do not invent business data.
You answer only using information returned from backend tools.
Never generate SQL.
Never assume customer information.
Never fabricate invoices.
Always provide concise business responses.
If data is unavailable, clearly state that no matching records were found.
If the request requires modifying CRM data, ask for user confirmation before executing any action.

You MUST always return structured JSON as your FINAL response to the user, formatted exactly like this (no markdown blocks like \`\`\`json):
{
  "title": "A short title for the response",
  "summary": "Concise summary of findings",
  "items": [
    { "label": "Key", "value": "Value" }
  ],
  "recommendations": ["Action item 1", "Action item 2"],
  "type": "invoice|lead|dashboard|customer|general"
}
`;

const chatWithCopilot = async (messages) => {
  try {
    // The last message is the current user prompt, so we pop it off for sendMessage
    const latestMessageObj = messages.pop();
    const latestMessageText = latestMessageObj.parts[0].text;

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: getAllToolSchemas() }]
      },
      history: messages // The rest of the conversation
    });

    let response = await chat.sendMessage({ message: latestMessageText });

    // If Gemini decided to call a function
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        const result = await executeTool(call.name, call.args);
        
        // Send the function execution result back to Gemini
        response = await chat.sendMessage({
          message: [{
            functionResponse: {
              name: call.name,
              response: { result }
            }
          }]
        });
      }
    }

    let jsonString = response.text;
    jsonString = jsonString.replace(/```(?:json)?\n?/g, '').trim();
    
    // Attempt to extract purely JSON
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.substring(startIndex, endIndex + 1);
    }
    
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error('Copilot Provider Error:', error);
    throw new Error('Failed to generate response from Copilot');
  }
};

module.exports = {
  chatWithCopilot
};
