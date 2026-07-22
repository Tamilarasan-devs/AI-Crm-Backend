const { Op } = require('sequelize');
const Product = require('../../models/Product');

const schema = {
  name: 'getProducts',
  description: 'Retrieve products based on criteria like low stock.',
  parameters: {
    type: 'OBJECT',
    properties: {
      lowStockThreshold: {
        type: 'NUMBER',
        description: 'Optional. If specified, retrieves products with stock less than or equal to this number.'
      }
    }
  }
};

const execute = async (args) => {
  const { lowStockThreshold } = args || {};

  const whereClause = {};
  if (lowStockThreshold !== undefined && lowStockThreshold !== null) {
    whereClause.stock = { [Op.lte]: lowStockThreshold };
  }

  const products = await Product.findAll({
    where: whereClause,
    attributes: ['name', 'sku', 'price', 'stock'],
    order: [['stock', 'ASC']],
    limit: 50
  });

  return {
    type: 'products',
    count: products.length,
    records: products.map(p => p.get({ plain: true }))
  };
};

module.exports = {
  schema,
  execute
};
