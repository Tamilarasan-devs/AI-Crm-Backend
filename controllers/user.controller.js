const User = require('../models/User');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

const createSubAccount = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, permissions } = req.body;
    
    // Ensure the requester is an Admin
    if (req.user.role !== 'Admin') {
      throw new ApiError(403, 'Only Admins can create sub-accounts');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const subUser = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'Staff',
      permissions: permissions || [],
      tenantId: req.tenantId // Link this sub-account to the admin's tenant
    });

    res.status(201).json(new ApiResponse(201, { id: subUser.id, name: subUser.name, email: subUser.email }, 'Sub-account created successfully'));
  } catch (error) {
    next(error);
  }
};

const getSubAccounts = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      throw new ApiError(403, 'Only Admins can view sub-accounts');
    }

    const accounts = await User.findAll({
      where: { tenantId: req.tenantId },
      attributes: ['id', 'name', 'email', 'phone', 'role', 'permissions', 'isActive', 'createdAt']
    });

    res.status(200).json(new ApiResponse(200, accounts, 'Sub-accounts fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateSubAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, permissions, isActive, name, email, phone, password } = req.body;

    if (req.user.role !== 'Admin') {
      throw new ApiError(403, 'Only Admins can update sub-accounts');
    }

    const subUser = await User.findOne({ where: { id, tenantId: req.tenantId } });
    if (!subUser) {
      throw new ApiError(404, 'Sub-account not found');
    }

    if (role !== undefined) subUser.role = role;
    if (permissions !== undefined) subUser.permissions = permissions;
    if (isActive !== undefined) subUser.isActive = isActive;
    if (name !== undefined) subUser.name = name;
    if (email !== undefined) subUser.email = email;
    if (phone !== undefined) subUser.phone = phone;
    if (password) subUser.password = password;

    await subUser.save();

    res.status(200).json(new ApiResponse(200, { id: subUser.id, name: subUser.name }, 'Sub-account updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubAccount,
  getSubAccounts,
  updateSubAccount
};
