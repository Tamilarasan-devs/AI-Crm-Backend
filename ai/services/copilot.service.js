const { chatWithCopilot } = require('../providers/gemini.provider');

/**
 * Handles incoming chat messages, manages session history if necessary, 
 * and calls the provider to get the AI response.
 */
const processUserMessage = async (message, history = []) => {
  // Construct the history format required by @google/genai
  // SDK expects `{ role: 'user' | 'model', content: string }`
  const formattedHistory = history.map(msg => {
    let textStr = '';
    if (typeof msg.content === 'object') {
      textStr = JSON.stringify(msg.content);
    } else {
      textStr = msg.content;
    }

    return {
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: textStr }]
    };
  });

  // Gemini API requires the history to start with a 'user' message
  // and strictly alternate. The frontend sends the initial AI greeting, 
  // so we must remove any leading 'model' messages.
  while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
    formattedHistory.shift();
  }

  // Append current message
  formattedHistory.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const aiResponse = await chatWithCopilot(formattedHistory);
  return aiResponse;
};

module.exports = {
  processUserMessage
};
