import type { Request, Response } from 'express';
import * as usersRepo from './users.repository';
import { pool } from '../../config/db';

export async function getMe(req: Request, res: Response) {
  const user = await usersRepo.findById(req.user!.userId);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
  res.json({ success: true, data: usersRepo.toPublic(user) });
}

export async function updateMe(req: Request, res: Response) {
  const user = await usersRepo.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, data: user });
}

export async function getMyClaims(req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT c.*, i.title AS item_title, i.type AS item_type, s.name AS space_name
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN spaces s ON s.id = i.space_id
     WHERE c.claimant_id = $1
     ORDER BY c.created_at DESC`,
    [req.user!.userId],
  );
  res.json({ success: true, data: rows });
}
