const NodeCache = require('node-cache');
const { getAggregatedMetrics } = require('./analytics.service');
const { buildPrompt } = require('./promptBuilder');
const { getDashboardInsights } = require('./gemini.service');

// Cache AI responses for 15 minutes (900 seconds)
const aiCache = new NodeCache({ stdTTL: 900 });

const generateFallbackInsights = (metrics) => {
  let businessHealth = 'Good';
  const overdue = metrics.followUps?.overdue || 0;
  const outOfStock = metrics.inventory?.outOfStock || 0;
  const unpaid = metrics.payments?.pending || 0;

  if (overdue > 5 || outOfStock > 5 || unpaid > 5) {
    businessHealth = 'Critical';
  } else if (overdue > 0 || outOfStock > 0 || unpaid > 0) {
    businessHealth = 'Fair';
  }

  const insights = [];
  const recommendations = [];
  const priorityTasks = [];

  if (metrics.revenue?.total > 0) {
    insights.push(`Total revenue stands at ₹${metrics.revenue.total.toLocaleString('en-IN')}.`);
  } else {
    insights.push('No sales recorded in the system yet.');
  }

  if (overdue > 0) {
    insights.push(`Found ${overdue} overdue customer follow-ups.`);
    recommendations.push('Clear the backlogged follow-ups immediately.');
    priorityTasks.push(`Resolve ${overdue} overdue follow-ups`);
  } else {
    insights.push('All customer follow-ups are up to date.');
  }

  if (outOfStock > 0) {
    insights.push(`${outOfStock} items are completely out of stock.`);
    recommendations.push('Reorder out of stock items.');
    priorityTasks.push(`Reorder ${outOfStock} out of stock items`);
  }

  if (unpaid > 0) {
    insights.push(`There are ${unpaid} pending customer invoices.`);
    recommendations.push('Follow up on unpaid client invoices.');
    priorityTasks.push(`Collect payments for ${unpaid} invoices`);
  }

  if (insights.length < 2) insights.push('System metrics are stable and healthy.');
  if (recommendations.length === 0) recommendations.push('Maintain current sales engagement.');
  if (priorityTasks.length === 0) priorityTasks.push('Monitor daily lead pipeline');

  const summary = businessHealth === 'Good' 
    ? 'Operations are running smoothly with all tasks on track.'
    : `Attention required: resolve pending actions to boost operations.`;

  return {
    businessHealth,
    summary,
    insights,
    recommendations,
    priorityTasks
  };
};

const generateAndCacheInsights = async (forceRefresh = false) => {
  const cacheKey = 'dashboard_insights';

  if (!forceRefresh) {
    const cachedData = aiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const metrics = await getAggregatedMetrics();

  try {
    const prompt = buildPrompt(metrics);
    const insights = await getDashboardInsights(prompt);

    insights.generatedAt = new Date().toISOString();
    aiCache.set(cacheKey, insights);

    return insights;
  } catch (error) {
    console.warn('Gemini API failed or rate-limited. Serving metrics-driven fallback insights:', error.message);
    const fallback = generateFallbackInsights(metrics);
    fallback.generatedAt = new Date().toISOString();
    return fallback;
  }
};

module.exports = {
  generateAndCacheInsights
};
