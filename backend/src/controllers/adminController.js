const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const AuditService = require('../services/audit/auditService');

class AdminController {
  /**
   * Get all users
   */
  static async getUsers(req, res, next) {
    try {
      const result = await db.query(
        'SELECT id, name, email, role, phone, is_active, created_at FROM users ORDER BY created_at DESC'
      );
      return res.json({ success: true, data: { users: result.rows } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create New System User
   */
  static async createUser(req, res, next) {
    try {
      const name = req.body.name || req.body.full_name;
      const { email, password, role = 'caseworker', phone } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required', code: 'VALIDATION_FAILED' });
      }

      const existing = await db.getOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already registered.', code: 'EMAIL_EXISTS' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'usr-' + uuidv4().substring(0, 8);

      await db.run(
        `INSERT INTO users (id, name, email, password_hash, role, phone, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 1, datetime('now'), datetime('now'))`,
        [userId, name, email.toLowerCase(), passwordHash, role, phone]
      );

      // If caseworker
      if (role === 'caseworker') {
        const cwId = 'cw-' + uuidv4().substring(0, 8);
        await db.run(
          `INSERT INTO caseworkers (id, user_id, full_name, phone, email, organization, title)
           VALUES ($1, $2, $3, $4, $5, 'ReTrac Community Recovery', 'Recovery Caseworker')`,
          [cwId, userId, name, phone || '+256700000000', email]
        );
      }

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Admin',
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: userId,
        metadata: { name, email, role }
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: { id: userId, name, email, role }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Toggle User Active Status
   */
  static async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const user = await db.getOne('SELECT id, is_active, name FROM users WHERE id = $1', [id]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found', code: 'NOT_FOUND' });
      }

      const newStatus = user.is_active ? 0 : 1;
      await db.run('UPDATE users SET is_active = $1, updated_at = datetime(\'now\') WHERE id = $2', [newStatus, id]);

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Admin',
        action: 'USER_STATUS_TOGGLED',
        entityType: 'USER',
        entityId: id,
        metadata: { newStatus: newStatus ? 'active' : 'inactive', targetUser: user.name }
      });

      return res.json({
        success: true,
        message: `User is now ${newStatus ? 'active' : 'deactivated'}.`,
        data: { id, is_active: !!newStatus }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Immutable Audit Logs
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { limit = 50, offset = 0, entityType, action, search } = req.query;
      const result = await AuditService.getLogs({
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        entityType,
        action,
        search
      });

      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get System Settings
   */
  static async getSettings(req, res, next) {
    try {
      const result = await db.query('SELECT * FROM system_settings ORDER BY key ASC');
      return res.json({ success: true, data: { settings: result.rows } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update System Setting
   */
  static async updateSetting(req, res, next) {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ success: false, message: 'Key and value required' });
      }

      await db.run(
        'UPDATE system_settings SET value = $1, updated_at = datetime(\'now\') WHERE key = $2',
        [String(value), key]
      );

      return res.json({ success: true, message: `Setting '${key}' updated successfully.` });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
