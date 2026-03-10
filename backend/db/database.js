// db/database.js — SQLite setup for True Blue Legals enquiries
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'enquiries.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Create enquiries table
db.exec(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT NOT NULL,
    practice_area TEXT,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'new',
    ip_address  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

module.exports = db;
