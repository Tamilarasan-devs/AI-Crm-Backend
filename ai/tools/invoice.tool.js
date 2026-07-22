const { Op } = require('sequelize');
const Invoice = require('../../models/Invoice');

const schema = {
  name: 'getPendingInvoices',
  description: 'Retrieves a list of pending or unpaid invoices. Can optionally filter by minimum amount.',
  parameters: {
    type: 'OBJECT',
    properties: {
      minimumAmount: {
        type: 'NUMBER',
        description: 'Optional. Filter invoices strictly greater than or equal to this amount.'
      }
    }
  }
};

const execute = async (args) => {
  const { minimumAmount } = args || {};

  const whereClause = {
    status: 'Pending'
  };

  if (minimumAmount !== undefined && minimumAmount !== null) {
    whereClause.total = { [Op.gte]: minimumAmount };
  }

  const invoices = await Invoice.findAll({
    where: whereClause,
    attributes: ['invoiceNumber', 'customerName', 'total', 'createdAt', 'status'],
    order: [['createdAt', 'DESC']],
    limit: 50 // Limit to prevent massive LLM context overload
  });

  return {
    count: invoices.length,
    invoices: invoices.map(i => i.get({ plain: true }))
  };
};

module.exports = {
  schema,
  execute
};
