const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Lead = require('../models/Lead');
const { Op } = require('sequelize');

const getDashboardData = async (req, res, next) => {
  try {
    // 1. Calculate Total Revenue (Sum of 'total' for 'Paid' invoices)
    const revenueSum = await Invoice.sum('total', { where: { status: 'Paid', userId: req.tenantId } });
    const totalRevenue = revenueSum || 0;

    // 2. Counts
    const totalProducts = await Product.count({ where: { userId: req.tenantId } });
    const totalInvoices = await Invoice.count({ where: { userId: req.tenantId } });
    const totalLeads = await Lead.count({ where: { userId: req.tenantId } });

    // 3. Recent Activity (Latest 5 Invoices)
    const latestInvoices = await Invoice.findAll({
      where: { userId: req.tenantId },
      limit: 5,
      order: [['createdAt', 'DESC']],
    });
    
    const recentActivity = latestInvoices.map(inv => ({
      id: inv.id,
      action: `Invoice #${inv.invoiceNumber} created`,
      user: inv.customerName,
      time: inv.createdAt,
      status: inv.status === 'Paid' ? 'success' : inv.status === 'Pending' ? 'warning' : 'danger'
    }));

    // 4. Revenue Overview Chart Data
    const filter = req.query.filter || 'monthly';
    let chartData = [];
    const now = new Date();

    if (filter === 'daily') {
      // Last 7 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const invoices = await Invoice.findAll({
        where: { status: 'Paid', userId: req.tenantId, createdAt: { [Op.gte]: startDate } },
        attributes: ['total', 'createdAt']
      });

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        chartData.push({ name: days[d.getDay()], total: 0, dateStr: d.toDateString() });
      }
      invoices.forEach(inv => {
        const invDate = new Date(inv.createdAt).toDateString();
        const bin = chartData.find(c => c.dateStr === invDate);
        if (bin) bin.total += parseFloat(inv.total);
      });
    } 
    else if (filter === 'weekly') {
      // Last 4 weeks
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);
      startDate.setHours(0, 0, 0, 0);

      const invoices = await Invoice.findAll({
        where: { status: 'Paid', userId: req.tenantId, createdAt: { [Op.gte]: startDate } },
        attributes: ['total', 'createdAt']
      });

      for (let i = 4; i >= 1; i--) {
        chartData.push({ name: `Week ${5-i}`, total: 0 });
      }
      invoices.forEach(inv => {
        const diffDays = Math.floor((now - new Date(inv.createdAt)) / (1000 * 60 * 60 * 24));
        const weekIdx = 3 - Math.floor(diffDays / 7);
        if (weekIdx >= 0 && weekIdx <= 3) {
          chartData[weekIdx].total += parseFloat(inv.total);
        }
      });
    }
    else if (filter === 'yearly' || filter === 'overall') {
      // Last 5 years
      const startYear = now.getFullYear() - 4;
      const startDate = new Date(`${startYear}-01-01`);

      const invoices = await Invoice.findAll({
        where: { status: 'Paid', userId: req.tenantId, createdAt: { [Op.gte]: startDate } },
        attributes: ['total', 'createdAt']
      });

      for (let i = 0; i < 5; i++) {
        chartData.push({ name: `${startYear + i}`, total: 0 });
      }
      invoices.forEach(inv => {
        const y = new Date(inv.createdAt).getFullYear();
        const bin = chartData.find(c => c.name === y.toString());
        if (bin) bin.total += parseFloat(inv.total);
      });
    }
    else {
      // Monthly (Default) - Current Year
      const currentYear = now.getFullYear();
      const startDate = new Date(`${currentYear}-01-01`);
      const endDate = new Date(`${currentYear}-12-31T23:59:59`);

      const yearInvoices = await Invoice.findAll({
        where: {
          status: 'Paid',
          userId: req.tenantId,
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: ['total', 'createdAt']
      });

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      chartData = monthNames.map(name => ({ name, total: 0 }));

      yearInvoices.forEach(inv => {
        const monthIndex = new Date(inv.createdAt).getMonth();
        chartData[monthIndex].total += parseFloat(inv.total);
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalProducts,
          totalInvoices,
          totalLeads
        },
        chartData,
        recentActivity
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData
};
