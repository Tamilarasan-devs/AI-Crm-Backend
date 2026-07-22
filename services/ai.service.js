const NodeCache = require('node-cache');
const { getAggregatedMetrics } = require('./analytics.service');
const { buildPrompt } = require('./promptBuilder');
const { getDashboardInsights } = require('./gemini.service');

// Cache AI responses for 15 minutes (900 seconds)
const aiCache = new NodeCache({ stdTTL: 900 });

const generateAndCacheInsights = async (forceRefresh = false) => {
  const cacheKey = 'dashboard_insights';

  if (!forceRefresh) {
    const cachedData = aiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // 1. Fetch data
  const metrics = await getAggregatedMetrics();

  // 2. Build prompt
  const prompt = buildPrompt(metrics);

  // 3. Get AI Insights
  const insights = await getDashboardInsights(prompt);

  // 4. Attach timestamp and cache
  insights.generatedAt = new Date().toISOString();
  aiCache.set(cacheKey, insights);

  return insights;
};

module.exports = {
  generateAndCacheInsights
};
