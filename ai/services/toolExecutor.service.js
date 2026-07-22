const invoiceTool = require('../tools/invoice.tool');
const leadTool = require('../tools/lead.tool');
const dashboardTool = require('../tools/dashboard.tool');
const productTool = require('../tools/product.tool');

const toolsMap = {
  getPendingInvoices: invoiceTool,
  getLeads: leadTool,
  getDashboardMetrics: dashboardTool,
  getProducts: productTool,
};

const getAllToolSchemas = () => {
  return Object.values(toolsMap).map(tool => tool.schema);
};

const executeTool = async (functionName, args) => {
  const tool = toolsMap[functionName];
  if (!tool) {
    throw new Error(`Tool ${functionName} is not implemented.`);
  }

  try {
    const result = await tool.execute(args);
    return result;
  } catch (error) {
    console.error(`Error executing tool ${functionName}:`, error);
    return { error: `Failed to execute ${functionName}: ${error.message}` };
  }
};

module.exports = {
  getAllToolSchemas,
  executeTool
};
