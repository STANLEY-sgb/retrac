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
   * Update System Setting(s)
   */
  static async updateSetting(req, res, next) {
    try {
      const { key, value } = req.body;

      if (key && value !== undefined) {
        await db.run(
          'UPDATE system_settings SET value = $1, updated_at = datetime(\'now\') WHERE key = $2',
          [String(value), key]
        );
        return res.json({ success: true, message: `Setting '${key}' updated successfully.` });
      }

      // Support bulk dictionary update e.g. { sms_provider: 'demo', ... }
      if (typeof req.body === 'object' && req.body !== null) {
        const entries = Object.entries(req.body);
        for (const [k, v] of entries) {
          if (k && v !== undefined) {
            await db.run(
              `INSERT INTO system_settings (key, value, updated_at)
               VALUES ($1, $2, datetime('now'))
               ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = datetime('now')`,
              [k, String(v)]
            );
          }
        }
        return res.json({ success: true, message: 'System settings updated successfully.' });
      }
      return res.json({ success: true, message: 'System settings updated.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get All Caseworkers with Live Operational Metrics
   */
  static async getCaseworkers(req, res, next) {
    try {
      const sql = `
        SELECT 
          cw.*,
          u.is_active,
          u.email as user_email,
          (SELECT COUNT(*) FROM clients c WHERE c.assigned_caseworker_id = cw.id AND c.status = 'active') as active_clients,
          (SELECT COUNT(*) FROM risk_alerts ra JOIN clients c ON ra.client_id = c.id WHERE c.assigned_caseworker_id = cw.id AND ra.status = 'active') as open_alerts,
          (SELECT COUNT(*) FROM interventions i WHERE i.caseworker_id = cw.id) as total_interventions,
          (SELECT MAX(i.performed_at) FROM interventions i WHERE i.caseworker_id = cw.id) as last_intervention_at
        FROM caseworkers cw
        LEFT JOIN users u ON cw.user_id = u.id
        ORDER BY cw.full_name ASC
      `;
      const result = await db.query(sql);
      return res.json({
        success: true,
        data: {
          caseworkers: result.rows.map(cw => ({
            ...cw,
            is_active: cw.is_active === 1 || cw.is_active === true,
            active_clients: parseInt(cw.active_clients || 0, 10),
            open_alerts: parseInt(cw.open_alerts || 0, 10),
            total_interventions: parseInt(cw.total_interventions || 0, 10),
            recent_activity: cw.last_intervention_at || cw.updated_at || cw.created_at
          }))
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create New Caseworker Profile & System Account
   */
  static async createCaseworker(req, res, next) {
    try {
      const {
        full_name,
        name,
        email,
        password = 'Password123!',
        phone = '+256700000000',
        organization = 'ReTrac Community Recovery',
        title = 'Rehabilitation Caseworker'
      } = req.body;

      const caseworkerName = full_name || name;
      if (!caseworkerName || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required.', code: 'VALIDATION_FAILED' });
      }

      const existingUser = await db.getOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.', code: 'EMAIL_EXISTS' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'usr-' + uuidv4().substring(0, 8);
      const cwId = 'cw-' + uuidv4().substring(0, 8);

      await db.run(
        `INSERT INTO users (id, name, email, password_hash, role, phone, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'caseworker', $5, 1, datetime('now'), datetime('now'))`,
        [userId, caseworkerName, email.toLowerCase(), passwordHash, phone]
      );

      await db.run(
        `INSERT INTO caseworkers (id, user_id, full_name, phone, email, organization, title, active_client_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, datetime('now'), datetime('now'))`,
        [cwId, userId, caseworkerName, phone, email.toLowerCase(), organization, title]
      );

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Admin',
        action: 'CASEWORKER_CREATED',
        entityType: 'CASEWORKER',
        entityId: cwId,
        metadata: { full_name: caseworkerName, email, organization, title }
      });

      return res.status(201).json({
        success: true,
        message: 'Caseworker profile created successfully.',
        data: {
          id: cwId,
          user_id: userId,
          full_name: caseworkerName,
          email,
          phone,
          organization,
          title,
          is_active: true,
          active_clients: 0
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update Caseworker Details
   */
  static async updateCaseworker(req, res, next) {
    try {
      const { id } = req.params;
      const { full_name, name, phone, email, organization, title } = req.body;

      const cw = await db.getOne('SELECT * FROM caseworkers WHERE id = $1', [id]);
      if (!cw) {
        return res.status(404).json({ success: false, message: 'Caseworker not found.', code: 'NOT_FOUND' });
      }

      const updatedName = full_name || name || cw.full_name;
      const updatedPhone = phone || cw.phone;
      const updatedEmail = email || cw.email;
      const updatedOrg = organization || cw.organization;
      const updatedTitle = title || cw.title;

      await db.run(
        `UPDATE caseworkers 
         SET full_name = $1, phone = $2, email = $3, organization = $4, title = $5, updated_at = datetime('now')
         WHERE id = $6`,
        [updatedName, updatedPhone, updatedEmail, updatedOrg, updatedTitle, id]
      );

      if (cw.user_id) {
        await db.run(
          `UPDATE users SET name = $1, phone = $2, email = $3, updated_at = datetime('now') WHERE id = $4`,
          [updatedName, updatedPhone, updatedEmail, cw.user_id]
        );
      }

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Admin',
        action: 'CASEWORKER_UPDATED',
        entityType: 'CASEWORKER',
        entityId: id,
        metadata: { full_name: updatedName, organization: updatedOrg, title: updatedTitle }
      });

      return res.json({
        success: true,
        message: 'Caseworker profile updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Toggle Caseworker Active/Inactive Status
   */
  static async toggleCaseworkerStatus(req, res, next) {
    try {
      const { id } = req.params;
      const cw = await db.getOne('SELECT cw.*, u.is_active FROM caseworkers cw JOIN users u ON cw.user_id = u.id WHERE cw.id = $1', [id]);
      if (!cw) {
        return res.status(404).json({ success: false, message: 'Caseworker not found.', code: 'NOT_FOUND' });
      }

      const newStatus = cw.is_active ? 0 : 1;
      await db.run('UPDATE users SET is_active = $1, updated_at = datetime(\'now\') WHERE id = $2', [newStatus, cw.user_id]);

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Admin',
        action: 'CASEWORKER_STATUS_TOGGLED',
        entityType: 'CASEWORKER',
        entityId: id,
        metadata: { full_name: cw.full_name, is_active: !!newStatus }
      });

      return res.json({
        success: true,
        message: `Caseworker is now ${newStatus ? 'active' : 'deactivated'}.`,
        data: { id, is_active: !!newStatus }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Assign or Reassign Client to Caseworker
   */
  static async assignClient(req, res, next) {
    try {
      const clientId = req.params.id || req.body.clientId || req.body.client_id;
      const caseworkerId = req.body.caseworkerId || req.body.caseworker_id;

      if (!clientId || !caseworkerId) {
        return res.status(400).json({ success: false, message: 'Client ID and Caseworker ID are required.', code: 'VALIDATION_FAILED' });
      }

      const client = await db.getOne('SELECT id, full_name, assigned_caseworker_id FROM clients WHERE id = $1', [clientId]);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.', code: 'CLIENT_NOT_FOUND' });
      }

      const cw = await db.getOne('SELECT id, full_name, user_id FROM caseworkers WHERE id = $1', [caseworkerId]);
      if (!cw) {
        return res.status(404).json({ success: false, message: 'Caseworker not found.', code: 'CASEWORKER_NOT_FOUND' });
      }

      const previousCaseworkerId = client.assigned_caseworker_id;

      await db.run(
        'UPDATE clients SET assigned_caseworker_id = $1, updated_at = datetime(\'now\') WHERE id = $2',
        [caseworkerId, clientId]
      );

      // Refresh client counts
      if (previousCaseworkerId) {
        const countOld = await db.getOne('SELECT COUNT(*) as cnt FROM clients WHERE assigned_caseworker_id = $1 AND status = \'active\'', [previousCaseworkerId]);
        await db.run('UPDATE caseworkers SET active_client_count = $1 WHERE id = $2', [countOld ? countOld.cnt : 0, previousCaseworkerId]);
      }
      const countNew = await db.getOne('SELECT COUNT(*) as cnt FROM clients WHERE assigned_caseworker_id = $1 AND status = \'active\'', [caseworkerId]);
      await db.run('UPDATE caseworkers SET active_client_count = $1 WHERE id = $2', [countNew ? countNew.cnt : 0, caseworkerId]);

      // Notify new caseworker
      if (cw.user_id) {
        const NotificationService = require('../services/notification/notificationService');
        await NotificationService.createNotification({
          userId: cw.user_id,
          clientId: client.id,
          type: 'system',
          title: `👤 Client Assigned: ${client.full_name}`,
          message: `${client.full_name} has been assigned to your recovery aftercare roster.`,
          metadata: { clientId: client.id, previousCaseworkerId }
        });
      }

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Admin',
        action: previousCaseworkerId ? 'CLIENT_REASSIGNED' : 'CLIENT_ASSIGNED',
        entityType: 'CLIENT',
        entityId: clientId,
        metadata: {
          clientName: client.full_name,
          caseworkerName: cw.full_name,
          caseworkerId,
          previousCaseworkerId
        }
      });

      return res.json({
        success: true,
        message: `Client ${client.full_name} assigned to ${cw.full_name} successfully.`,
        data: {
          clientId,
          caseworkerId,
          caseworkerName: cw.full_name
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
