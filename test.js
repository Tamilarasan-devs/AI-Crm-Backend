require('dotenv').config();
const { chatWithCopilot } = require('./ai/providers/gemini.provider');

(async () => {
  try {
    const res = await chatWithCopilot([
      { role: 'user', content: 'Hello' }
    ]);
    console.log(res);
  } catch (err) {
    console.error('ERROR TEST SCRIPT:');
    console.error(err);
  }
})();
