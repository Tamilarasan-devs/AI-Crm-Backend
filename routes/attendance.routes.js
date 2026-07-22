const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.route('/summary')
  .get(attendanceController.getMonthlySummary);

router.route('/')
  .post(attendanceController.markAttendance)
  .get(attendanceController.getAttendanceByDate);

module.exports = router;
