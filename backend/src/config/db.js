const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./logger');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../dashboard_studio.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error(`Error opening database: ${err.message}`);
  } else {
    logger.info('Connected to SQLite database.');
  }
});

db.serialize(() => {
  db.run(`PRAGMA journal_mode = WAL;`);
  db.run(`PRAGMA foreign_keys = ON;`);

  db.run(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      row_count INTEGER NOT NULL DEFAULT 0,
      col_count INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dashboards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dataset_id TEXT REFERENCES datasets(id) ON DELETE SET NULL,
      canvas_json TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

module.exports = db;
