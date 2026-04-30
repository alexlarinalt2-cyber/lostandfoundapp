import type { Request, Response } from 'express';
import { pool } from '../../config/db';

export async function listNotifications(req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [req.user!.userId],
  );
  res.json({ success: true, data: rows });
}

export async function markRead(req: Request, res: Response) {
  await pool.query(
    `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user!.userId],
  );
  res.json({ success: true, data: null });
}

export async function markAllRead(req: Request, res: Response) {
  await pool.query(
    `UPDATE notifications SET read = TRUE WHERE user_id = $1`,
    [req.user!.userId],
  );
  res.json({ success: true, data: null });
}
