const Employee = require('../models/Employee');

exports.createEmployee = async (req, res, next) => {
  try {
    const { name, phone, email, designation, joiningDate, salary, status } = req.body;
    const employee = await Employee.create({
      name,
      phone,
      email,
      designation,
      joiningDate,
      salary,
      status,
      userId: req.tenantId
    });
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { userId: req.tenantId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ where: { id, userId: req.tenantId } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    await employee.update(req.body);
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ where: { id, userId: req.tenantId } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    await employee.destroy();
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};
