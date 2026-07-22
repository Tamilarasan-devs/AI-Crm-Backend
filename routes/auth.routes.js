const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const { validate, registerSchema, loginSchema } = require('../validations/auth.validation');

const { protect } = require('../middlewares/auth.middleware');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);

module.exports = router;
