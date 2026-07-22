const { generateAndCacheInsights } = require('../services/ai.service');

const getDashboardInsights = async (req, res, next) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const insights = await generateAndCacheInsights(forceRefresh);

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('AI Insights Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI insights',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardInsights
};
