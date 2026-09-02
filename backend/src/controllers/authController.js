const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../database/db');
const AuditService = require('../services/audit/auditService');

class AuthController {
  /**
   * User Login (Admin, Caseworker, Employer)
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email address and password.',
          code: 'INVALID_CREDENTIALS_INPUT'
        });
      }

      // Find user
      const user = await db.getOne(
        'SELECT id, name, email, password_hash, role, phone, is_active FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
          code: 'AUTH_FAILED'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact your system administrator.',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
          code: 'AUTH_FAILED'
        });
      }

      // Fetch linked profile metadata
      let profile = null;
      if (user.role === 'caseworker') {
        profile = await db.getOne('SELECT * FROM caseworkers WHERE user_id = $1', [user.id]);
      } else if (user.role === 'employer') {
        profile = await db.getOne('SELECT * FROM employers WHERE user_id = $1', [user.id]);
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, name: user.name },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
      );

      // Audit log
      await AuditService.log({
        userId: user.id,
        userName: user.name,
        action: 'USER_LOGIN',
        entityType: 'AUTH',
        entityId: user.id,
        ipAddress: req.ip
      });

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profile
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * User Logout
   */
  static async logout(req, res, next) {
    try {
      if (req.user) {
        await AuditService.log({
          userId: req.user.id,
          userName: req.user.name,
          action: 'USER_LOGOUT',
          entityType: 'AUTH',
          entityId: req.user.id,
          ipAddress: req.ip
        });
      }

      return res.json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getMe(req, res, next) {
    try {
      let profile = null;
      if (req.user.role === 'caseworker') {
        profile = await db.getOne('SELECT * FROM caseworkers WHERE user_id = $1', [req.user.id]);
      } else if (req.user.role === 'employer') {
        profile = await db.getOne('SELECT * FROM employers WHERE user_id = $1', [req.user.id]);
      }

      return res.json({
        success: true,
        user: {
          ...req.user,
          profile
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
