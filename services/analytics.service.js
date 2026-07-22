const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const { Op } = require('sequelize');

const getAggregatedMetrics = async () => {
  const now = new Date();
  
  // Date boundaries
  const startOfDay = new Date(now.setHours(0,0,0,0));
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday start
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Revenue Metrics
  const totalRevenueResult = await Invoice.sum('total', { where: { status: 'Paid' } });
  const totalRevenue = totalRevenueResult || 0;

  const todayRevenueResult = await Invoice.sum('total', { 
    where: { status: 'Paid', createdAt: { [Op.gte]: startOfDay } } 
  });
  
  const weekRevenueResult = await Invoice.sum('total', { 
    where: { status: 'Paid', createdAt: { [Op.gte]: startOfWeek } } 
  });
  
  const monthRevenueResult = await Invoice.sum('total', { 
    where: { status: 'Paid', createdAt: { [Op.gte]: startOfMonth } } 
  });

  // 2. Counts
  const totalSales = await Invoice.count({ where: { status: 'Paid' } });
  const totalOrders = await Invoice.count();
  
  // A simple way to get unique customers from Invoice table if there's no Customer table
  const uniqueCustomers = await Invoice.count({ distinct: true, col: 'customerEmail' });

  // 3. Leads
  const newLeads = await Lead.count({ where: { status: 'New' } });
  const convertedLeads = await Lead.count({ where: { status: 'Won' } }); // Lead model uses 'Won'
  const lostLeads = await Lead.count({ where: { status: 'Lost' } });

  // 4. Follow-ups
  const pendingFollowups = await FollowUp.count({ where: { status: 'Pending' } });
  const completedFollowups = await FollowUp.count({ where: { status: 'Completed' } });
  
  // Overdue follow-ups: Pending status and date in the past
  const overdueFollowups = await FollowUp.count({ 
    where: { 
      status: 'Pending', 
      date: { [Op.lt]: startOfDay } 
    } 
  });

  // 5. Invoices & Payments
  const pendingPayments = await Invoice.count({ where: { status: 'Pending' } });
  const paidInvoices = totalSales; // Same as paid invoices

  // 6. Deliveries
  const pendingDeliveries = await Invoice.count({ where: { deliveryStatus: 'Pending Delivery' } });
  const completedDeliveries = await Invoice.count({ where: { deliveryStatus: 'Delivered' } });

  // 7. Inventory
  const products = await Product.findAll({ attributes: ['name', 'stock', 'price'] });
  const lowStockThreshold = 10;
  
  let lowStockProducts = [];
  let healthyStockProductsCount = 0;
  let outOfStockCount = 0;

  products.forEach(p => {
    if (p.stock === 0) outOfStockCount++;
    else if (p.stock <= lowStockThreshold) lowStockProducts.push(p.name);
    else healthyStockProductsCount++;
  });

  return {
    revenue: {
      total: parseFloat(totalRevenue),
      today: parseFloat(todayRevenueResult || 0),
      week: parseFloat(weekRevenueResult || 0),
      month: parseFloat(monthRevenueResult || 0)
    },
    sales: {
      totalSales,
      totalOrders,
      totalCustomers: uniqueCustomers
    },
    leads: {
      new: newLeads,
      converted: convertedLeads,
      lost: lostLeads
    },
    followUps: {
      pending: pendingFollowups,
      completed: completedFollowups,
      overdue: overdueFollowups
    },
    payments: {
      pending: pendingPayments,
      paid: paidInvoices
    },
    deliveries: {
      pending: pendingDeliveries,
      completed: completedDeliveries
    },
    inventory: {
      totalProducts: products.length,
      outOfStock: outOfStockCount,
      lowStockNames: lowStockProducts,
      healthyStock: healthyStockProductsCount
    }
  };
};

module.exports = {
  getAggregatedMetrics
};
