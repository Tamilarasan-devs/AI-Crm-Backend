const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.route('/')
  .post(userController.createSubAccount)
  .get(userController.getSubAccounts);

router.route('/:id')
  .put(userController.updateSubAccount);

module.exports = router;
