const rateLimit = require('express-rate-limit');

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after a few minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Stricter Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
