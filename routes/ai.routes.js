const express = require('express');
const router = express.Router();
const { getDashboardInsights } = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/dashboard-insights', protect, getDashboardInsights);

module.exports = router;
