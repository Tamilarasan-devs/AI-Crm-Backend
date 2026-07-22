const { getAggregatedMetrics } = require('../../services/analytics.service');

const schema = {
  name: 'getDashboardMetrics',
  description: 'Retrieves overall dashboard metrics including total revenue, total sales, leads count, follow-ups, deliveries, and inventory summary.',
  parameters: {
    type: 'OBJECT',
    properties: {}
  }
};

const execute = async () => {
  // We can re-use the analytics service we built earlier!
  const metrics = await getAggregatedMetrics();
  return {
    type: 'dashboard',
    data: metrics
  };
};

module.exports = {
  schema,
  execute
};
