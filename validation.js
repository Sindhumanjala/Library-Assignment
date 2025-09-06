const Joi = require('joi');

/**
 * Validation schema for user registration
 */
const registerValidation = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required'
    }),
    
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      'any.required': 'Password is required'
    }),
    
  role: Joi.string()
    .valid('ADMIN', 'MEMBER')
    .default('MEMBER')
    .messages({
      'any.only': 'Role must be either ADMIN or MEMBER'
    })
});

/**
 * Validation schema for user login
 */
const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.min': 'Password cannot be empty'
    })
});

/**
 * Validation schema for adding/updating books
 */
const bookValidation = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required'
    }),
    
  author: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Author name cannot be empty',
      'string.max': 'Author name must not exceed 100 characters',
      'any.required': 'Author is required'
    }),
    
  isbn: Joi.string()
    .trim()
    .pattern(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid ISBN number',
      'any.required': 'ISBN is required'
    }),
    
  availabilityStatus: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Availability status must be true or false'
    })
});

/**
 * Validation schema for updating books (all fields optional)
 */
const bookUpdateValidation = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title must not exceed 200 characters'
    }),
    
  author: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'Author name cannot be empty',
      'string.max': 'Author name must not exceed 100 characters'
    }),
    
  isbn: Joi.string()
    .trim()
    .pattern(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .messages({
      'string.pattern.base': 'Please provide a valid ISBN number'
    }),
    
  availabilityStatus: Joi.boolean()
    .messages({
      'boolean.base': 'Availability status must be true or false'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validation schema for search queries
 */
const searchValidation = Joi.object({
  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'Search term cannot be empty',
      'string.max': 'Search term must not exceed 100 characters'
    }),
    
  searchBy: Joi.string()
    .valid('title', 'author', 'both')
    .default('both')
    .messages({
      'any.only': 'searchBy must be title, author, or both'
    }),
    
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    }),
    
  available: Joi.boolean()
    .messages({
      'boolean.base': 'Available must be true or false'
    })
});

/**
 * Validation schema for pagination
 */
const paginationValidation = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    })
});

/**
 * Validation schema for MongoDB ObjectId
 */
const mongoIdValidation = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'Invalid ID format'
  });

/**
 * Helper function to validate request parameters
 */
const validateParams = (schema, params) => {
  const { error, value } = schema.validate(params);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

/**
 * Helper function to validate query parameters
 */
const validateQuery = (schema, query) => {
  const { error, value } = schema.validate(query, { allowUnknown: true });
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

/**
 * Middleware for validating request body
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          code: 'VALIDATION_ERROR',
          details: error.details
        }
      });
    }
    req.body = value;
    next();
  };
};

/**
 * Middleware for validating query parameters
 */
const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { allowUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          code: 'VALIDATION_ERROR',
          details: error.details
        }
      });
    }
    req.query = value;
    next();
  };
};

module.exports = {
  // Validation schemas
  registerValidation,
  loginValidation,
  bookValidation,
  bookUpdateValidation,
  searchValidation,
  paginationValidation,
  mongoIdValidation,
  
  // Helper functions
  validateParams,
  validateQuery,
  
  // Middleware functions
  validateBody,
  validateQueryParams
};