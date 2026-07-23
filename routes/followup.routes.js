const express = require('express');
const router = express.Router();
const { getAllFollowUps, updateFollowUpStatus, deleteFollowUp } = require('../controllers/followup.controller');

router.get('/', getAllFollowUps);
router.patch('/:id/status', updateFollowUpStatus);
router.delete('/:id', deleteFollowUp);

module.exports = router;
