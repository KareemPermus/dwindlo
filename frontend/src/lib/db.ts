import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS timers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      duration_seconds INTEGER NOT NULL,
      end_time TEXT,
      status TEXT NOT NULL DEFAULT 'idle',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM timers').get() as any;
  if (count.c === 0) {
    const insert = db.prepare('INSERT INTO timers (slug, title, duration_seconds, status) VALUES (?, ?, ?, ?)');
    insert.run('timer-pomodoro', 'Pomodoro', 1500, 'idle');
    insert.run('timer-break', 'Short Break', 300, 'idle');
    insert.run('timer-long-break', 'Long Break', 900, 'idle');
  }

  return db;
}

function isSupabase(client: any): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export { isSupabase };