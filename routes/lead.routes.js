const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.middleware');
const { createLeadSchema, updateLeadSchema } = require('../validations/lead.validation');
const { createLead, getLeads, updateLeadStatus, updateLead, deleteLead, getTrashedLeads, restoreLead, forceDeleteLead, emptyLeadTrash } = require('../controllers/lead.controller');
const { createFollowUp } = require('../controllers/followup.controller');

// Need auth and validation middleware applied here in production
router.post('/', validate(createLeadSchema), createLead);
router.get('/', getLeads);
router.get('/trash', getTrashedLeads);
router.patch('/:id/restore', restoreLead);
router.patch('/:id/status', updateLeadStatus);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.delete('/trash/empty', emptyLeadTrash);
router.delete('/:id/force', forceDeleteLead);
router.delete('/:id', deleteLead);
router.post('/:leadId/followups', createFollowUp);

module.exports = router;
