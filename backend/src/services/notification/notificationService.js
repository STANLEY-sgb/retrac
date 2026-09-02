const { v4: uuidv4 } = require('uuid');
const db = require('../../database/db');

class NotificationService {
  /**
   * Create an in-app notification
   */
  static async createNotification({ userId, clientId = null, type, title, message, metadata = {} }) {
    try {
      const id = 'notif-' + uuidv4().substring(0, 8);
      const metaStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

      await db.run(
        `INSERT INTO notifications (id, user_id, client_id, type, title, message, is_read, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 0, $7, datetime('now'))`,
        [id, userId, clientId, type, title, message, metaStr]
      );

      return { id, userId, clientId, type, title, message, is_read: false };
    } catch (err) {
      console.error('⚠️ Failed to create notification:', err.message);
      return null;
    }
  }

  /**
   * Notify all active caseworkers and admin
   */
  static async broadcastToStaff({ clientId = null, type, title, message, metadata = {} }) {
    try {
      const staffUsers = await db.query(
        "SELECT id FROM users WHERE role IN ('admin', 'caseworker') AND is_active = 1"
      );

      for (const u of staffUsers.rows) {
        await this.createNotification({
          userId: u.id,
          clientId,
          type,
          title,
          message,
          metadata
        });
      }
    } catch (err) {
      console.error('⚠️ Failed to broadcast notification:', err.message);
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId, { limit = 30, unreadOnly = false } = {}) {
    let sql = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];

    if (unreadOnly) {
      sql += ' AND is_read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT $2';
    params.push(limit);

    const result = await db.query(sql, params);
    const unreadCountRes = await db.getOne(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = 0',
      [userId]
    );

    return {
      notifications: result.rows,
      unreadCount: unreadCountRes ? parseInt(unreadCountRes.count, 10) : 0
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    await db.run(
      'UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    await db.run(
      'UPDATE notifications SET is_read = 1 WHERE user_id = $1',
      [userId]
    );
    return true;
  }
}

module.exports = NotificationService;
