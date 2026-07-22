const User = require('../models/User');
const { ApiError, ApiResponse } = require('../utils/apiResponse');
const { generateAccessAndRefreshTokens } = require('../utils/generateTokens');
const { Op } = require('sequelize');

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
      role
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
    const { identifier, password } = req.body;

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
