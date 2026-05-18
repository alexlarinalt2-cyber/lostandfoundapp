import { pool } from '../../config/db';
import * as itemsRepo from '../items/items.repository';
import { emitToUser } from '../../services/socket.service';
import type { CreateClaimInput } from '@laf/shared';

export async function createClaim(
  itemId: string,
  claimantId: string,
  input: CreateClaimInput,
  photos?: { url: string; thumbnailUrl: string; order: number }[],
) {
  const item = await itemsRepo.findById(itemId);
  if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });
  if (item.status !== 'open') throw Object.assign(new Error('Item is not open for claims'), { status: 409 });
  if (item.reported_by === claimantId) throw Object.assign(new Error('Cannot claim your own item'), { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO claims (item_id, claimant_id, message, identifying_marks, photos, pickup_method, phone, availability)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      itemId,
      claimantId,
      input.message,
      JSON.stringify(input.identifyingMarks ?? []),
      JSON.stringify(photos ?? []),
      input.pickupMethod ?? 'in_person',
      input.phone ?? null,
      input.availability ?? null,
    ],
  );
  const claim = rows[0];

  await createNotification(item.reported_by, 'claim_received', {
    claimId: claim.id,
    itemId,
    itemTitle: item.title,
  });

  return claim;
}

export async function approveClaim(itemId: string, claimId: string, ownerId: string) {
  const item = await itemsRepo.findById(itemId);
  if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });
  if (item.reported_by !== ownerId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: claimRows } = await client.query(
      `UPDATE claims SET status = 'approved', resolved_at = NOW() WHERE id = $1 AND item_id = $2 RETURNING *`,
      [claimId, itemId],
    );
    if (!claimRows[0]) throw Object.assign(new Error('Claim not found'), { status: 404 });

    await client.query(
      `UPDATE claims SET status = 'rejected', resolved_at = NOW() WHERE item_id = $1 AND id != $2 AND status = 'pending'`,
      [itemId, claimId],
    );

    await client.query(`UPDATE items SET status = 'claimed' WHERE id = $1`, [itemId]);
    await client.query('COMMIT');

    await createNotification(claimRows[0].claimant_id, 'claim_approved', {
      claimId,
      itemId,
      itemTitle: item.title,
    });

    // Create conversation so claimant and finder can chat
    await pool.query(
      `INSERT INTO conversations (claim_id, item_id) VALUES ($1, $2) ON CONFLICT (claim_id) DO NOTHING`,
      [claimId, itemId],
    );
    const { rows: convRows } = await pool.query(
      `SELECT id FROM conversations WHERE claim_id = $1`, [claimId]
    );
    if (convRows[0]) {
      await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, content, type) VALUES ($1, NULL, 'Claim approved · contact details exchanged', 'system')`,
        [convRows[0].id]
      );
    }

    return claimRows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function rejectClaim(itemId: string, claimId: string, ownerId: string) {
  const item = await itemsRepo.findById(itemId);
  if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });
  if (item.reported_by !== ownerId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const { rows } = await pool.query(
    `UPDATE claims SET status = 'rejected', resolved_at = NOW() WHERE id = $1 AND item_id = $2 RETURNING *`,
    [claimId, itemId],
  );
  if (!rows[0]) throw Object.assign(new Error('Claim not found'), { status: 404 });

  await createNotification(rows[0].claimant_id, 'claim_rejected', {
    claimId,
    itemId,
    itemTitle: item.title,
  });

  return rows[0];
}

async function createNotification(userId: string, type: string, payload: Record<string, unknown>) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, type, payload) VALUES ($1, $2, $3) RETURNING *`,
    [userId, type, JSON.stringify(payload)],
  );
  emitToUser(userId, 'notification:new', rows[0]);
}
