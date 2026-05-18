import type { Request, Response } from 'express';
import { pool } from '../../config/db';
import * as claimsService from './claims.service';
import * as itemsRepo from '../items/items.repository';
import * as spacesRepo from '../spaces/spaces.repository';
import { uploadImage } from '../../services/storage.service';
import { env } from '../../config/env';

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
  let uploadedPhotos: { url: string; thumbnailUrl: string; order: number }[] = [];

  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length > 0 && env.CLOUDINARY_CLOUD_NAME) {
      uploadedPhotos = await Promise.all(
        files.map((f, i) =>
          uploadImage(f.buffer, `lostandfound/claims/${req.params.itemId}`).then((r) => ({
            url: r.url,
            thumbnailUrl: r.thumbnailUrl,
            order: i,
          })),
        ),
      );
    }
  } catch (err) {
    console.error('Claim photo upload failed, continuing without photos:', err);
  }

  const claim = await claimsService.createClaim(
    req.params.itemId,
    req.user!.userId,
    req.body,
    uploadedPhotos,
  );
  res.status(201).json({ success: true, data: claim });
}

export async function getClaim(req: Request, res: Response) {
  const item = await itemsRepo.findById(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });

  const membership = await spacesRepo.getMembership(item.space_id, req.user!.userId);
  const isOwnerOrManager = item.reported_by === req.user!.userId || membership?.role === 'manager';
  if (!isOwnerOrManager) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const { rows } = await pool.query(
    `SELECT c.*,
            u.display_name AS claimant_name,
            u.email AS claimant_email,
            u.avatar_url AS claimant_avatar,
            u.created_at AS claimant_member_since,
            (SELECT COUNT(*) FROM claims c2 WHERE c2.claimant_id = c.claimant_id) AS claimant_total_claims,
            (SELECT COUNT(*) FROM claims c2 WHERE c2.claimant_id = c.claimant_id AND c2.item_id != c.item_id) AS claimant_prior_claims
     FROM claims c
     JOIN users u ON u.id = c.claimant_id
     WHERE c.id = $1 AND c.item_id = $2`,
    [req.params.claimId, req.params.itemId],
  );
  if (!rows[0]) return res.status(404).json({ success: false, error: { message: 'Claim not found' } });
  res.json({ success: true, data: { claim: rows[0], item } });
}

export async function getMyClaim(req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT c.* FROM claims c WHERE c.item_id = $1 AND c.claimant_id = $2`,
    [req.params.itemId, req.user!.userId],
  );
  res.json({ success: true, data: rows[0] ?? null });
}

export async function updateClaim(req: Request, res: Response) {
  const { status } = req.body as { status: 'approved' | 'rejected' };
  const result =
    status === 'approved'
      ? await claimsService.approveClaim(req.params.itemId, req.params.claimId, req.user!.userId)
      : await claimsService.rejectClaim(req.params.itemId, req.params.claimId, req.user!.userId);
  res.json({ success: true, data: result });
}
