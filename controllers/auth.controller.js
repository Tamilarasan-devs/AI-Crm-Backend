const User = require('../models/User');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
};
const { ApiError, ApiResponse } = require('../utils/apiResponse');
const { generateAccessAndRefreshTokens } = require('../utils/generateTokens');
const { Op } = require('sequelize');
const crypto = require('crypto');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { phone }] 
      } 
    });
    
    if (existingUser) {
      throw new ApiError(409, 'User with this email or phone already exists');
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'Admin', // The creator of a new account is the Owner/Admin of their workspace
      permissions: ['dashboard', 'leads', 'products', 'employees', 'attendance', 'invoices', 'follow-ups']
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.status(201).json(new ApiResponse(201, { user: userResponse, accessToken, refreshToken }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password, latitude, longitude } = req.body;

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: identifier }, { phone: identifier }] 
      } 
    });
    
    if (!user) {
      throw new ApiError(401, 'Invalid email/phone or password');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is inactive. Please contact administrator.');
    }

    // Geo-Fencing for Staff
    if (user.role === 'Staff') {
      const company = await Company.findOne({ where: { userId: user.tenantId } });
      let distance = null;

      if (company && company.latitude && company.longitude) {
        if (!latitude || !longitude) {
           throw new ApiError(403, 'Location is required for employee login.');
        }
        
        distance = getDistance(
          parseFloat(company.latitude), 
          parseFloat(company.longitude), 
          parseFloat(latitude), 
          parseFloat(longitude)
        );

        if (distance > 50) {
          throw new ApiError(403, 'You must be within 50 metres of the office to check in/out.');
        }
      }

      // Mark Attendance
      const employee = await Employee.findOne({
        where: {
          userId: user.tenantId,
          [Op.or]: [{ email: user.email }, { phone: user.phone }]
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toLocaleTimeString('en-GB', { hour12: false });
      
      let attendance = await Attendance.findOne({
        where: {
          date: today,
          userId: user.tenantId,
          ...(employee ? { employeeId: employee.id } : {})
        }
      });

      if (!attendance) {
        await Attendance.create({
          date: today,
          status: 'Present',
          checkIn: timeNow,
          latitude: latitude || null,
          longitude: longitude || null,
          distance: distance ? distance.toFixed(2) : null,
          employeeId: employee ? employee.id : null,
          userId: user.tenantId
        });
      }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.status(200).json(new ApiResponse(200, { user: userResponse, accessToken, refreshToken }, 'User logged in successfully'));
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Requires auth middleware to set req.user
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    const user = await User.findByPk(req.user.id);
    user.refreshToken = null;
    await user.save({ validate: false });

    // Geo-Fencing for Staff Logout
    if (user.role === 'Staff') {
      const { latitude, longitude } = req.body;
      const company = await Company.findOne({ where: { userId: user.tenantId } });
      
      if (company && company.latitude && company.longitude) {
        if (!latitude || !longitude) {
           throw new ApiError(403, 'Location is required for employee logout.');
        }
        
        const distance = getDistance(
          parseFloat(company.latitude), 
          parseFloat(company.longitude), 
          parseFloat(latitude), 
          parseFloat(longitude)
        );

        if (distance > 50) {
          throw new ApiError(403, 'You must be within 50 metres of the office to check in/out.');
        }
      }

      // Update Attendance Checkout
      const employee = await Employee.findOne({
        where: {
          userId: user.tenantId,
          [Op.or]: [{ email: user.email }, { phone: user.phone }]
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toLocaleTimeString('en-GB', { hour12: false });
      
      let attendance = await Attendance.findOne({
        where: {
          date: today,
          userId: user.tenantId,
          ...(employee ? { employeeId: employee.id } : {})
        }
      });

      if (attendance) {
        attendance.checkOut = timeNow;
        await attendance.save();
      }
    }

    res.status(200).json(new ApiResponse(200, null, 'User logged out successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout
};
