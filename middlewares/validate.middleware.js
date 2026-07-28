const { ApiError } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // Removes keys not defined in the schema
  });

  if (error) {
    const errorDetails = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    return next(new ApiError(400, 'Validation Error', errorDetails));
  }

  // Update req.body with the sanitized value (strips unknown keys)
  req.body = value;
  next();
};

module.exports = validate;
