import { pool } from '../../config/db';
import crypto from 'crypto';

function generateInviteCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

export async function findByUser(userId: string) {
  const { rows } = await pool.query(
    `SELECT s.*, sm.role AS member_role
     FROM spaces s
     JOIN space_memberships sm ON sm.space_id = s.id
     WHERE sm.user_id = $1
     ORDER BY s.name`,
    [userId],
  );
  return rows;
}

export async function findById(spaceId: string, userId?: string) {
  if (userId) {
    const { rows } = await pool.query(
      `SELECT s.*, sm.role AS member_role
       FROM spaces s
       JOIN space_memberships sm ON sm.space_id = s.id AND sm.user_id = $2
       WHERE s.id = $1`,
      [spaceId, userId],
    );
    return rows[0] ?? null;
  }
  const { rows } = await pool.query('SELECT * FROM spaces WHERE id = $1', [spaceId]);
  return rows[0] ?? null;
}

export async function leave(spaceId: string, userId: string) {
  await pool.query('DELETE FROM space_memberships WHERE space_id = $1 AND user_id = $2', [
    spaceId,
    userId,
  ]);
}

export async function findByInviteCode(code: string) {
  const { rows } = await pool.query('SELECT * FROM spaces WHERE invite_code = $1', [code]);
  return rows[0] ?? null;
}

export async function create(input: {
  name: string;
  type: string;
  address?: string;
  createdBy: string;
}) {
  const inviteCode = generateInviteCode();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO spaces (name, type, address, invite_code, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [input.name, input.type, input.address ?? null, inviteCode, input.createdBy],
    );
    const space = rows[0];
    await client.query(
      `INSERT INTO space_memberships (space_id, user_id, role) VALUES ($1, $2, 'manager')`,
      [space.id, input.createdBy],
    );
    await client.query('COMMIT');
    return space;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function addMember(spaceId: string, userId: string) {
  await pool.query(
    `INSERT INTO space_memberships (space_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [spaceId, userId],
  );
}

export async function getMembership(spaceId: string, userId: string) {
  const { rows } = await pool.query(
    'SELECT * FROM space_memberships WHERE space_id = $1 AND user_id = $2',
    [spaceId, userId],
  );
  return rows[0] ?? null;
}

export async function getMembers(spaceId: string) {
  const { rows } = await pool.query(
    `SELECT u.id, u.display_name, u.avatar_url, sm.role, sm.joined_at
     FROM space_memberships sm
     JOIN users u ON u.id = sm.user_id
     WHERE sm.space_id = $1
     ORDER BY sm.joined_at`,
    [spaceId],
  );
  return rows;
}

export async function updateMemberRole(spaceId: string, userId: string, role: string) {
  await pool.query(
    'UPDATE space_memberships SET role = $1 WHERE space_id = $2 AND user_id = $3',
    [role, spaceId, userId],
  );
}

export async function removeMember(spaceId: string, userId: string) {
  await pool.query('DELETE FROM space_memberships WHERE space_id = $1 AND user_id = $2', [
    spaceId,
    userId,
  ]);
}

export async function deleteSpace(spaceId: string) {
  await pool.query('DELETE FROM spaces WHERE id = $1', [spaceId]);
}

export async function update(spaceId: string, input: { name?: string; address?: string }) {
  const { rows } = await pool.query(
    `UPDATE spaces SET name = COALESCE($1, name), address = COALESCE($2, address) WHERE id = $3 RETURNING *`,
    [input.name ?? null, input.address ?? null, spaceId],
  );
  return rows[0];
}
