const { GoogleGenAI } = require('@google/genai');

const getDashboardInsights = async (promptText) => {
  if (!process.env['GEMINI-API']) {
    throw new Error('GEMINI-API key is missing in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey: process.env['GEMINI-API'] });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let jsonString = response.text;
    
    // Safely extract just the JSON object from the response
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.substring(startIndex, endIndex + 1);
    }
    
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Check if it's a quota/rate limit error
    if (error.status === 429) {
      throw new Error('You have reached your Gemini API usage limit. Please wait a few seconds and try again.');
    }
    
    throw new Error('Failed to generate insights from Gemini');
  }
};

module.exports = {
  getDashboardInsights
};
