const Joi = require('joi');

const createLeadSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.',
  }),
  phone: Joi.string().trim().required().messages({
    'string.empty': 'Phone number is required.',
  }),
  company: Joi.string().trim().allow(null, ''),
  source: Joi.string().trim().allow(null, ''),
  status: Joi.string().valid('New', 'Contacted', 'Qualified', 'Lost', 'Won').default('New'),
  notes: Joi.string().trim().allow(null, ''),
});

const updateLeadSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email(),
  phone: Joi.string().trim(),
  company: Joi.string().trim().allow(null, ''),
  source: Joi.string().trim().allow(null, ''),
  status: Joi.string().valid('New', 'Contacted', 'Qualified', 'Lost', 'Won'),
  notes: Joi.string().trim().allow(null, ''),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
};
