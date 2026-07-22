const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLeadStatus, updateLead, deleteLead, getTrashedLeads, restoreLead, forceDeleteLead, emptyLeadTrash } = require('../controllers/lead.controller');
const { createFollowUp } = require('../controllers/followup.controller');

// Need auth and validation middleware applied here in production
router.post('/', createLead);
router.get('/', getLeads);
router.get('/trash', getTrashedLeads);
router.patch('/:id/restore', restoreLead);
router.patch('/:id/status', updateLeadStatus);
router.put('/:id', updateLead);
router.delete('/trash/empty', emptyLeadTrash);
router.delete('/:id/force', forceDeleteLead);
router.delete('/:id', deleteLead);
router.post('/:leadId/followups', createFollowUp);

module.exports = router;
