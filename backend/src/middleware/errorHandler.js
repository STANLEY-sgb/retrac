// Consistent Centralized Error Handler
function errorHandler(err, req, res, next) {
  console.error('💥 Unhandled Application Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' ? { errorDetails: err.stack } : {})
  });
}

// 404 Route Not Found Handler
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found on ReTrac server.`,
    code: 'NOT_FOUND'
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
