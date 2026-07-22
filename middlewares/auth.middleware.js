const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new ApiError(401, 'Not authorized, user not found');
      }

      req.user = user;
      req.tenantId = user.tenantId || user.id;
      next();
    } catch (error) {
      throw new ApiError(401, 'Not authorized, token failed');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
