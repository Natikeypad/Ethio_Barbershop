/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log full error details for server diagnostics
  console.error('[Error Handler]:', err);

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.length > 0 ? errors.join(', ') : 'Validation error';
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': ${err.value}`;
  }

  // Handle MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateFields = Object.keys(err.keyValue || {});
    const fieldName = duplicateFields[0] || 'field';
    const value = err.keyValue ? err.keyValue[fieldName] : '';
    message = `Duplicate value error: ${fieldName} '${value}' already exists`;
  }

  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

export default errorHandler;
