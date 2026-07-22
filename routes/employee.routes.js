const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

router.route('/')
  .post(employeeController.createEmployee)
  .get(employeeController.getEmployees);

router.route('/:id')
  .put(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

module.exports = router;
