const express = require('express');
const router = express.Router();
const { getAllFollowUps, updateFollowUpStatus } = require('../controllers/followup.controller');

router.get('/', getAllFollowUps);
router.patch('/:id/status', updateFollowUpStatus);

module.exports = router;
