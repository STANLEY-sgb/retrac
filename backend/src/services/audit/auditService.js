const { v4: uuidv4 } = require('uuid');
const db = require('../../database/db');

class AuditService {
  /**
   * Record immutable audit log entry
   */
  static async log({ userId = null, userName = 'System', action, entityType, entityId = null, ipAddress = '127.0.0.1', metadata = {} }) {
    try {
      const id = 'aud-' + uuidv4().substring(0, 8);
      const metaStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

      await db.run(
        `INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, ip_address, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, datetime('now'))`,
        [id, userId, userName, action, entityType, entityId, ipAddress, metaStr]
      );
    } catch (err) {
      console.error('⚠️ Failed to write audit log:', err.message);
    }
  }

  /**
   * Get audit logs with pagination and search
   */
  static async getLogs({ limit = 50, offset = 0, entityType = null, action = null, search = null }) {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let pIndex = 1;

    if (entityType) {
      sql += ` AND entity_type = $${pIndex++}`;
      params.push(entityType);
    }

    if (action) {
      sql += ` AND action = $${pIndex++}`;
      params.push(action);
    }

    if (search) {
      sql += ` AND (action LIKE $${pIndex} OR user_name LIKE $${pIndex} OR metadata LIKE $${pIndex})`;
      params.push(`%${search}%`);
      pIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${pIndex++} OFFSET $${pIndex++}`;
    params.push(limit, offset);

    const result = await db.query(sql, params);
    const countRes = await db.getOne('SELECT COUNT(*) as total FROM audit_logs');
    
    return {
      logs: result.rows,
      total: countRes ? parseInt(countRes.total, 10) : result.rows.length
    };
  }
}

module.exports = AuditService;
