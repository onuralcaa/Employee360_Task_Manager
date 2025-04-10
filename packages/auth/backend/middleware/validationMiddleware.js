const { createError } = require('../utils/logger');

const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }));
      
      res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }

    next();
  };
};

const validateId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400).json({
      message: 'Invalid ID format'
    });
    return;
  }
  
  next();
};

const validateQueryParams = (allowedParams) => {
  return (req, res, next) => {
    const invalidParams = Object.keys(req.query)
      .filter(param => !allowedParams.includes(param));

    if (invalidParams.length > 0) {
      res.status(400).json({
        message: `Invalid query parameters: ${invalidParams.join(', ')}`
      });
      return;
    }

    next();
  };
};

module.exports = {
  validateSchema,
  validateId,
  validateQueryParams
};