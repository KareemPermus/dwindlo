import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      if (isSupabase(db)) {
        const { data, error } = await db.from('timers').select('*').eq('id', id).single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        return res.json(fmt(data));
      }
      const row = db.prepare('SELECT * FROM timers WHERE id = ?').get(id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      return res.json(fmt(row));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PUT') {
    const { title, duration_seconds, end_time, status } = req.body;
    try {
      if (isSupabase(db)) {
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (duration_seconds !== undefined) updates.duration_seconds = duration_seconds;
        if (end_time !== undefined) updates.end_time = end_time;
        if (status !== undefined) updates.status = status;
        const { data, error } = await db.from('timers').update(updates).eq('id', id).select().single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        return res.json(fmt(data));
      }
      const existing = db.prepare('SELECT * FROM timers WHERE id = ?').get(id) as any;
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const t = title ?? existing.title;
      const d = duration_seconds ?? existing.duration_seconds;
      const e = end_time !== undefined ? end_time : existing.end_time;
      const s = status ?? existing.status;
      db.prepare('UPDATE timers SET title=?, duration_seconds=?, end_time=?, status=? WHERE id=?').run(t, d, e, s, id);
      const row = db.prepare('SELECT * FROM timers WHERE id = ?').get(id);
      return res.json(fmt(row));
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (isSupabase(db)) {
        const { error } = await db.from('timers').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true });
      }
      db.prepare('DELETE FROM timers WHERE id = ?').run(id);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).end();
}

function fmt(r: any) {
  return {
    id: r.id,
    title: r.title,
    duration_seconds: r.duration_seconds,
    end_time: r.end_time || null,
    status: r.status,
    created_at: r.created_at,
  };
}