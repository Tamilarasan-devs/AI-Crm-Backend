require('dotenv').config();
const { getDashboardInsights } = require('./services/gemini.service');

(async () => {
  try {
    const res = await getDashboardInsights("Hello, give me a test json { \"businessHealth\": \"Good\" }");
    console.log("Success:", res);
  } catch (e) {
    console.error("Test Error:", e);
  }
})();
