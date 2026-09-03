const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../database/db');

// Verify JWT Token Middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.split(' ')[1] 
    : (req.query && req.query.token)
    ? req.query.token
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await db.getOne(
      'SELECT id, name, email, role, phone, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user session or user account deactivated.',
        code: 'USER_INACTIVE'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Session expired or token invalid. Please log in again.',
      code: 'AUTH_TOKEN_INVALID'
    });
  }
}

// Role-Based Authorization Middleware
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated user.',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role.`,
        code: 'FORBIDDEN_ROLE'
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
