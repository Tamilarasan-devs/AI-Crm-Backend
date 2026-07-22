require('dotenv').config();
const { processUserMessage } = require('./ai/services/copilot.service');

(async () => {
  try {
    const res = await processUserMessage("test message", [{role: "user", content: "hi"}]);
    console.log(res);
  } catch (err) {
    console.error('ERROR TEST SCRIPT2:');
    console.error(err);
  }
})();
