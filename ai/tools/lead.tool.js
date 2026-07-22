const { Op } = require('sequelize');
const Lead = require('../../models/Lead');
const FollowUp = require('../../models/FollowUp');

const schema = {
  name: 'getLeads',
  description: 'Retrieve leads based on status (e.g., New, Contacted, Qualified, Won, Lost) or fetch follow-ups (today, overdue, pending).',
  parameters: {
    type: 'OBJECT',
    properties: {
      status: {
        type: 'STRING',
        description: 'Optional. Filter leads by status (New, Contacted, Qualified, Won, Lost).'
      },
      followUpType: {
        type: 'STRING',
        description: 'Optional. Can be "today", "overdue", or "pending".'
      }
    }
  }
};

const execute = async (args) => {
  const { status, followUpType } = args || {};
  
  if (followUpType) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    
    let whereClause = { status: 'Pending' };
    
    if (followUpType === 'today') {
      whereClause.date = startOfDay;
    } else if (followUpType === 'overdue') {
      whereClause.date = { [Op.lt]: startOfDay };
    }

    const followUps = await FollowUp.findAll({
      where: whereClause,
      include: [{ model: Lead, attributes: ['firstName', 'lastName', 'email', 'phone'] }],
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: 30
    });

    return {
      type: 'follow_ups',
      count: followUps.length,
      records: followUps.map(f => f.get({ plain: true }))
    };
  }

  // Otherwise return leads
  const whereClause = {};
  if (status) {
    whereClause.status = { [Op.iLike]: status };
  }

  const leads = await Lead.findAll({
    where: whereClause,
    attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'status', 'createdAt'],
    order: [['createdAt', 'DESC']],
    limit: 30
  });

  return {
    type: 'leads',
    count: leads.length,
    records: leads.map(l => l.get({ plain: true }))
  };
};

module.exports = {
  schema,
  execute
};
