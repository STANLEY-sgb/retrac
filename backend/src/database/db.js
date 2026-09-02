const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let pgPool = null;
let sqliteDb = null;
let isPg = false;

// Initialize Database Adapter
function initDatabase() {
  if (pgPool || sqliteDb) return;

  const databaseUrl = process.env.DATABASE_URL;
  const isProd = process.env.NODE_ENV === 'production';

  // If DATABASE_URL is defined and not using sqlite prefix
  if (databaseUrl && !databaseUrl.startsWith('sqlite') && isProd) {
    try {
      pgPool = new Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000,
      });

      isPg = true;
      console.log('📦 Database: Configured for PostgreSQL (Production)');
      return;
    } catch (err) {
      console.warn('⚠️ PostgreSQL connection warning. Falling back to embedded SQLite engine:', err.message);
    }
  }

  // Embedded SQLite Fallback for Instant Local Execution & Tests
  const dbDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = process.env.NODE_ENV === 'test' 
    ? path.join(dbDir, 'test.db')
    : path.join(dbDir, 'retrac.db');

  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  isPg = false;
  console.log(`📦 Database: Connected to Embedded SQLite DB at ${dbPath}`);
}

// Convert PostgreSQL style parameterized query ($1, $2, etc.) to SQLite (?) and expand params
function prepareQueryForSqlite(sql, params = []) {
  const transformedParams = [];
  
  let normalizedSql = sql.replace(/\$(\d+)/g, (match, num) => {
    const idx = parseInt(num, 10) - 1;
    if (idx >= 0 && idx < params.length) {
      transformedParams.push(params[idx]);
    } else {
      transformedParams.push(undefined);
    }
    return '?';
  });

  normalizedSql = normalizedSql
    .replace(/TIMESTAMP\s+WITH\s+TIME\s+ZONE/gi, 'TIMESTAMP')
    .replace(/JSONB/gi, 'TEXT')
    .replace(/BOOLEAN/gi, 'INTEGER')
    .replace(/DECIMAL\([^)]+\)/gi, 'NUMERIC');

  return { sql: normalizedSql, params: transformedParams };
}

// Execute full raw SQL script (e.g. schema.sql DDL)
async function exec(sql) {
  initDatabase();
  if (isPg && pgPool) {
    return pgPool.query(sql);
  }
  return sqliteDb.exec(sql);
}

// Generic Query Interface (returns { rows, rowCount })
async function query(text, params = []) {
  initDatabase();

  if (isPg && pgPool) {
    try {
      // Normalize SQLite-specific datetime('now') to PostgreSQL CURRENT_TIMESTAMP
      const pgSql = text.replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');
      const res = await pgPool.query(pgSql, params);
      return { rows: res.rows, rowCount: res.rowCount };
    } catch (pgError) {
      if (process.env.NODE_ENV !== 'production' && !sqliteDb) {
        console.warn('⚠️ PostgreSQL query failed, switching to local SQLite database:', pgError.message);
        isPg = false;
        pgPool = null;
        initDatabase();
        return query(text, params);
      }
      throw pgError;
    }
  }

  // SQLite execution
  const { sql: normalizedSql, params: sqliteParams } = prepareQueryForSqlite(text, params);
  const trimmed = normalizedSql.trim().toUpperCase();

  try {
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH') || trimmed.startsWith('PRAGMA')) {
      const stmt = sqliteDb.prepare(normalizedSql);
      const rows = stmt.all(...sqliteParams);
      return { rows, rowCount: rows.length };
    } else {
      const stmt = sqliteDb.prepare(normalizedSql);
      const info = stmt.run(...sqliteParams);
      return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
    }
  } catch (err) {
    console.error('SQL Execution Error:', err.message);
    console.error('Original SQL:', text);
    console.error('Params:', params);
    throw err;
  }
}

async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows && result.rows.length > 0 ? result.rows[0] : null;
}

async function run(text, params = []) {
  return query(text, params);
}

async function testConnection() {
  try {
    initDatabase();
    if (isPg && pgPool) {
      await pgPool.query('SELECT 1');
      return { status: 'connected', type: 'PostgreSQL' };
    } else if (sqliteDb) {
      sqliteDb.prepare('SELECT 1').get();
      return { status: 'connected', type: 'SQLite (Embedded)' };
    }
    return { status: 'uninitialized' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

module.exports = {
  initDatabase,
  query,
  getOne,
  run,
  exec,
  testConnection,
  isPostgres: () => isPg
};
