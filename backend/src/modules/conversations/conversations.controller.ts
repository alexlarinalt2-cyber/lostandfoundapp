import type { Request, Response } from 'express';
import { pool } from '../../config/db';
import { emitToUser } from '../../services/socket.service';

export async function getConversationByClaim(req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT conv.*,
            c.claimant_id, c.item_id as claim_item_id,
            i.reported_by as finder_id,
            i.title as item_title, i.category as item_category, i.type as item_type,
            cu.display_name as claimant_name, cu.email as claimant_email,
            fu.display_name as finder_name, fu.email as finder_email
     FROM conversations conv
     JOIN claims c ON c.id = conv.claim_id
     JOIN items i ON i.id = conv.item_id
     JOIN users cu ON cu.id = c.claimant_id
     JOIN users fu ON fu.id = i.reported_by
     WHERE conv.claim_id = $1`,
    [req.params.claimId],
  );
  if (!rows[0]) return res.status(404).json({ success: false, error: { message: 'Conversation not found' } });
  const conv = rows[0];
  // Only claimant or finder can access
  const uid = req.user!.userId;
  if (conv.claimant_id !== uid && conv.finder_id !== uid)
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  res.json({ success: true, data: conv });
}

export async function listMessages(req: Request, res: Response) {
  const { rows: convRows } = await pool.query(
    `SELECT conv.*, c.claimant_id, i.reported_by as finder_id
     FROM conversations conv
     JOIN claims c ON c.id = conv.claim_id
     JOIN items i ON i.id = conv.item_id
     WHERE conv.id = $1`,
    [req.params.convId],
  );
  if (!convRows[0]) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  const uid = req.user!.userId;
  if (convRows[0].claimant_id !== uid && convRows[0].finder_id !== uid)
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const { rows } = await pool.query(
    `SELECT m.*, u.display_name as sender_name FROM messages m
     LEFT JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1 ORDER BY m.created_at ASC`,
    [req.params.convId],
  );
  res.json({ success: true, data: rows });
}

export async function sendMessage(req: Request, res: Response) {
  const { rows: convRows } = await pool.query(
    `SELECT conv.*, c.claimant_id, i.reported_by as finder_id
     FROM conversations conv
     JOIN claims c ON c.id = conv.claim_id
     JOIN items i ON i.id = conv.item_id
     WHERE conv.id = $1`,
    [req.params.convId],
  );
  if (!convRows[0]) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  const uid = req.user!.userId;
  if (convRows[0].claimant_id !== uid && convRows[0].finder_id !== uid)
    return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const content = (req.body.content as string)?.trim();
  if (!content) return res.status(400).json({ success: false, error: { message: 'content required' } });

  const { rows } = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)
     RETURNING *, (SELECT display_name FROM users WHERE id = $2) as sender_name`,
    [req.params.convId, uid, content],
  );
  const msg = rows[0];

  // Notify the other participant via socket
  const otherId = uid === convRows[0].claimant_id ? convRows[0].finder_id : convRows[0].claimant_id;
  emitToUser(otherId, 'message:new', { conversationId: req.params.convId, message: msg });

  res.status(201).json({ success: true, data: msg });
}
