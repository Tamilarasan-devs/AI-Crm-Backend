const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/ai.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.post('/chat', protect, handleChat);

module.exports = router;
