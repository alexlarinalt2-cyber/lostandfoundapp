import { pool } from '../../config/db';
import type { User } from '@laf/shared';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  created_at: Date;
}

export function toPublic(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role as User['role'],
    createdAt: row.created_at.toISOString(),
  };
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function create(input: {
  email: string;
  passwordHash: string;
  displayName: string;
}): Promise<User> {
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash, display_name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.email, input.passwordHash, input.displayName],
  );
  return toPublic(rows[0]);
}

export async function updatePassword(userId: string, passwordHash: string): Promise<void> {
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    passwordHash,
    userId,
  ]);
}

export async function updateProfile(
  userId: string,
  input: { displayName?: string; avatarUrl?: string },
): Promise<User> {
  const { rows } = await pool.query<UserRow>(
    `UPDATE users
     SET display_name = COALESCE($1, display_name),
         avatar_url   = COALESCE($2, avatar_url),
         updated_at   = NOW()
     WHERE id = $3
     RETURNING *`,
    [input.displayName ?? null, input.avatarUrl ?? null, userId],
  );
  return toPublic(rows[0]);
}
