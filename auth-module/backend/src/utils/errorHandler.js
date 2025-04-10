class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const createError = (message, status = 500) => {
  return new AppError(message, status);
};

module.exports = {
  AppError,
  createError
};