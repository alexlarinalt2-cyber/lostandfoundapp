import type { Request, Response } from 'express';
import { pool } from '../../config/db';
import * as claimsService from './claims.service';
import * as itemsRepo from '../items/items.repository';
import * as spacesRepo from '../spaces/spaces.repository';

export async function listClaims(req: Request, res: Response) {
  const item = await itemsRepo.findById(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });

  const membership = await spacesRepo.getMembership(item.space_id, req.user!.userId);
  const isOwnerOrManager = item.reported_by === req.user!.userId || membership?.role === 'manager';
  if (!isOwnerOrManager) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const { rows } = await pool.query(
    `SELECT c.*, u.display_name AS claimant_name, u.avatar_url AS claimant_avatar
     FROM claims c
     JOIN users u ON u.id = c.claimant_id
     WHERE c.item_id = $1
     ORDER BY c.created_at DESC`,
    [req.params.itemId],
  );
  res.json({ success: true, data: rows });
}

export async function createClaim(req: Request, res: Response) {
  const claim = await claimsService.createClaim(req.params.itemId, req.user!.userId, req.body);
  res.status(201).json({ success: true, data: claim });
}

export async function updateClaim(req: Request, res: Response) {
  const { status } = req.body as { status: 'approved' | 'rejected' };
  const result =
    status === 'approved'
      ? await claimsService.approveClaim(req.params.itemId, req.params.claimId, req.user!.userId)
      : await claimsService.rejectClaim(req.params.itemId, req.params.claimId, req.user!.userId);
  res.json({ success: true, data: result });
}
