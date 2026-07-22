const Lead = require('../models/Lead');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

const createLead = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const existingLead = await Lead.findOne({
      where: {
        userId: req.tenantId,
        [Op.or]: [{ email: req.body.email }, { phone: req.body.phone }]
      }
    });

    if (existingLead) {
      if (existingLead.email === req.body.email) {
        throw new ApiError(400, 'A lead with this email already exists.');
      }
      if (existingLead.phone === req.body.phone) {
        throw new ApiError(400, 'A lead with this phone number already exists.');
      }
    }

    req.body.userId = req.tenantId;
    const lead = await Lead.create(req.body);
    res.status(201).json(new ApiResponse(201, lead, 'Lead created successfully'));
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const leads = await Lead.findAll({ 
      where: { userId: req.tenantId },
      order: [['createdAt', 'DESC']] 
    });
    res.status(200).json(new ApiResponse(200, leads, 'Leads fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lead = await Lead.findOne({ where: { id, userId: req.tenantId } });
    
    if (!lead) {
      throw new ApiError(404, 'Lead not found');
    }
    
    lead.status = status;
    await lead.save();
    
    res.status(200).json(new ApiResponse(200, lead, 'Lead status updated successfully'));
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({ where: { id, userId: req.tenantId } });
    if (!lead) throw new ApiError(404, 'Lead not found');

    const { Op } = require('sequelize');
    const existingLead = await Lead.findOne({
      where: {
        id: { [Op.ne]: id },
        userId: req.tenantId,
        [Op.or]: [{ email: req.body.email }, { phone: req.body.phone }]
      }
    });

    if (existingLead) {
      if (existingLead.email === req.body.email) {
        throw new ApiError(400, 'A lead with this email already exists.');
      }
      if (existingLead.phone === req.body.phone) {
        throw new ApiError(400, 'A lead with this phone number already exists.');
      }
    }

    await lead.update(req.body);
    res.status(200).json(new ApiResponse(200, lead, 'Lead updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({ where: { id, userId: req.tenantId } });
    if (!lead) throw new ApiError(404, 'Lead not found');
    await lead.destroy(); // Soft delete because of paranoid: true
    res.status(200).json(new ApiResponse(200, null, 'Lead deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const getTrashedLeads = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const leads = await Lead.findAll({
      paranoid: false,
      where: {
        userId: req.tenantId,
        deletedAt: {
          [Op.not]: null
        }
      },
      order: [['deletedAt', 'DESC']]
    });
    res.status(200).json(new ApiResponse(200, leads, 'Trashed leads fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const restoreLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({ where: { id, userId: req.tenantId }, paranoid: false });
    if (!lead) throw new ApiError(404, 'Lead not found in trash');
    await lead.restore();
    res.status(200).json(new ApiResponse(200, lead, 'Lead restored successfully'));
  } catch (error) {
    next(error);
  }
};

const forceDeleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({ where: { id, userId: req.tenantId }, paranoid: false });
    if (!lead) throw new ApiError(404, 'Lead not found in trash');
    await lead.destroy({ force: true });
    res.status(200).json(new ApiResponse(200, null, 'Lead permanently deleted'));
  } catch (error) {
    next(error);
  }
};

const emptyLeadTrash = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    await Lead.destroy({
      where: {
        userId: req.tenantId,
        deletedAt: {
          [Op.not]: null
        }
      },
      force: true
    });
    res.status(200).json(new ApiResponse(200, null, 'Trash emptied successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
  updateLeadStatus,
  updateLead,
  deleteLead,
  getTrashedLeads,
  restoreLead,
  forceDeleteLead,
  emptyLeadTrash
};
