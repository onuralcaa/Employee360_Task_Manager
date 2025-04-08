const { createError } = require('../utils/logger');

const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.context.key,
          message: detail.message
        }));
        
        throw createError('Validation failed', 400, { validationErrors });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

const validateId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw createError('Invalid ID format', 400);
  }
  
  next();
};

const validateQueryParams = (allowedParams) => {
  return (req, res, next) => {
    const invalidParams = Object.keys(req.query)
      .filter(param => !allowedParams.includes(param));

    if (invalidParams.length > 0) {
      throw createError(
        `Invalid query parameters: ${invalidParams.join(', ')}`,
        400
      );
    }

    next();
  };
};

module.exports = {
  validateSchema,
  validateId,
  validateQueryParams
};