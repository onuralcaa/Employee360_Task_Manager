const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),

  surname: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),

  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
      'string.pattern.base': 'Username can only contain letters, numbers and underscores',
      'any.required': 'Username is required'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain at least one letter and one number',
      'any.required': 'Password is required'
    }),

  role: Joi.string()
    .valid('admin', 'personel')
    .default('personel')
    .messages({
      'any.only': 'Role must be either admin or personel'
    }),

  department: Joi.string()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Department name cannot exceed 100 characters'
    }),

  position: Joi.string()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Position name cannot exceed 100 characters'
    })
});

const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters'
    }),

  surname: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters'
    }),

  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain at least one letter and one number'
    }),

  department: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Department name cannot exceed 100 characters'
    }),

  position: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Position name cannot exceed 100 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};