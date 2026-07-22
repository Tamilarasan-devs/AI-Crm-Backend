const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

exports.markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    
    // Check if employee exists and belongs to user
    const employee = await Employee.findOne({ where: { id: employeeId, userId: req.tenantId } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Upsert attendance for that date
    let attendance = await Attendance.findOne({
      where: { employeeId, date, userId: req.tenantId }
    });

    if (attendance) {
      attendance = await attendance.update({ status, checkIn, checkOut, notes });
    } else {
      attendance = await Attendance.create({
        employeeId,
        date,
        status,
        checkIn,
        checkOut,
        notes,
        userId: req.tenantId
      });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const attendanceRecords = await Attendance.findAll({
      where: { date, userId: req.tenantId },
      include: [{ model: Employee, attributes: ['name', 'designation'] }]
    });

    res.status(200).json({ success: true, data: attendanceRecords });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    // Determine the start and end dates of the requested month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    const daysInMonth = endDate.getDate();

    // Find all active employees for this user
    const employees = await Employee.findAll({
      where: { userId: req.tenantId }
    });

    // Fetch all attendance for this month
    const attendanceRecords = await Attendance.findAll({
      where: {
        userId: req.tenantId,
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      }
    });

    // Calculate summary per employee
    const summary = employees.map(emp => {
      const empAttendance = attendanceRecords.filter(a => a.employeeId === emp.id);
      
      const presentCount = empAttendance.filter(a => a.status === 'Present').length;
      const absentCount = empAttendance.filter(a => a.status === 'Absent').length;
      const halfDayCount = empAttendance.filter(a => a.status === 'Half-Day').length;
      const leaveCount = empAttendance.filter(a => a.status === 'Leave').length;

      // Base salary, fallback to 0 if not set
      const baseSalary = parseFloat(emp.salary) || 0;
      
      // We will use standard 30 days as requested, or daysInMonth if we want to be accurate.
      // Since user approved 30 days logic:
      const dailyWage = baseSalary / 30;
      
      // Calculate effective present days (Present = 1, Half-Day = 0.5)
      const effectivePresentDays = presentCount + (halfDayCount * 0.5);
      
      // Payout
      const calculatedPayout = (dailyWage * effectivePresentDays).toFixed(2);

      return {
        employeeId: emp.id,
        name: emp.name,
        designation: emp.designation,
        baseSalary,
        presentCount,
        absentCount,
        halfDayCount,
        leaveCount,
        calculatedPayout: parseFloat(calculatedPayout)
      };
    });

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
