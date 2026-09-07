import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    try {
      if (isSupabase(db)) {
        const { data, error } = await db.from('timers').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data.map(formatTimer));
      }
      const rows = db.prepare('SELECT * FROM timers ORDER BY created_at DESC').all();
      return res.json(rows.map(formatTimer));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { title, duration_seconds } = req.body;
    if (!title || !duration_seconds) return res.status(400).json({ error: 'title and duration_seconds required' });
    const slug = generateSlug(title);
    try {
      if (isSupabase(db)) {
        const { data, error } = await db.from('timers').insert({ title, slug, duration_seconds, status: 'idle' }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(formatTimer(data));
      }
      const info = db.prepare('INSERT INTO timers (title, slug, duration_seconds, status) VALUES (?, ?, ?, ?)').run(title, slug, duration_seconds, 'idle');
      const row = db.prepare('SELECT * FROM timers WHERE id = ?').get(info.lastInsertRowid);
      return res.status(201).json(formatTimer(row));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}

function formatTimer(r: any) {
  return {
    id: r.id,
    title: r.title,
    duration_seconds: r.duration_seconds,
    end_time: r.end_time || null,
    status: r.status,
    created_at: r.created_at,
  };
}