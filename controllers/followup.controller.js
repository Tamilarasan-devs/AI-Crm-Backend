const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

const createFollowUp = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { date, time, method, notes } = req.body;

    const lead = await Lead.findOne({ where: { id: leadId, userId: req.tenantId } });
    if (!lead) throw new ApiError(404, 'Lead not found');

    const followUp = await FollowUp.create({
      LeadId: lead.id,
      date,
      time,
      method,
      notes,
      createdByName: req.user?.name || 'System',
    });

    res.status(201).json(new ApiResponse(201, followUp, 'Follow-up scheduled successfully'));
  } catch (error) {
    next(error);
  }
};

const getAllFollowUps = async (req, res, next) => {
  try {
    const followUps = await FollowUp.findAll({
      order: [['date', 'ASC'], ['time', 'ASC']],
      include: [{ 
        model: Lead, 
        attributes: ['id', 'firstName', 'email', 'phone'],
        where: { userId: req.tenantId } 
      }]
    });
    res.status(200).json(new ApiResponse(200, followUps, 'Follow-ups fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateFollowUpStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const followUp = await FollowUp.findOne({
      where: { id },
      include: [{ model: Lead, where: { userId: req.tenantId }, attributes: [] }]
    });
    if (!followUp) throw new ApiError(404, 'Follow-up not found');

    followUp.status = status;
    await followUp.save();

    res.status(200).json(new ApiResponse(200, followUp, 'Follow-up status updated'));
  } catch (error) {
    next(error);
  }
};

const deleteFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const followUp = await FollowUp.findOne({
      where: { id },
      include: [{ model: Lead, where: { userId: req.tenantId }, attributes: [] }]
    });
    if (!followUp) throw new ApiError(404, 'Follow-up not found');
    
    await followUp.destroy();
    
    res.status(200).json(new ApiResponse(200, null, 'Follow-up deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFollowUp,
  getAllFollowUps,
  updateFollowUpStatus,
  deleteFollowUp,
};
