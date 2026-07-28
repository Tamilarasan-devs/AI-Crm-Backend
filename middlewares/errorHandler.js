const { ApiError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Sequelize validation and unique constraint errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map(e => e.message);
    error = new ApiError(400, messages.join(', '), err.errors);
  }

  // Handle standard errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Log error using Winston
  if (error.statusCode >= 500) {
    logger.error(`${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (error.stack) logger.error(error.stack);
  } else {
    logger.warn(`${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  };

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
