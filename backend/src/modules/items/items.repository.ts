import { pool } from '../../config/db';
import type { CreateItemInput, UpdateItemInput, ListItemsQuery } from '@laf/shared';

export async function listItems(spaceId: string, query: ListItemsQuery) {
  const conditions: string[] = ['i.space_id = $1'];
  const params: unknown[] = [spaceId];
  let idx = 2;

  if (query.type) { conditions.push(`i.type = $${idx++}`); params.push(query.type); }
  if (query.category) { conditions.push(`i.category = $${idx++}`); params.push(query.category); }
  if (query.status) { conditions.push(`i.status = $${idx++}`); params.push(query.status); }
  if (query.search) {
    conditions.push(`i.search_vector @@ plainto_tsquery('english', $${idx++})`);
    params.push(query.search);
  }
  if (query.cursor) {
    const [ts, id] = query.cursor.split('_');
    conditions.push(`(i.date_reported, i.id) < ($${idx++}::timestamptz, $${idx++}::uuid)`);
    params.push(ts, id);
  }

  const where = conditions.join(' AND ');
  const limit = query.limit + 1;
  params.push(limit);

  const { rows } = await pool.query(
    `SELECT i.*,
            u.display_name AS reporter_name,
            COALESCE(json_agg(p ORDER BY p.display_order) FILTER (WHERE p.id IS NOT NULL), '[]') AS photos,
            (SELECT COUNT(*) FROM claims c WHERE c.item_id = i.id) AS claim_count
     FROM items i
     JOIN users u ON u.id = i.reported_by
     LEFT JOIN item_photos p ON p.item_id = i.id
     WHERE ${where}
     GROUP BY i.id, u.display_name
     ORDER BY i.date_reported DESC, i.id DESC
     LIMIT $${idx}`,
    params,
  );

  const hasMore = rows.length > query.limit;
  const items = hasMore ? rows.slice(0, query.limit) : rows;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? `${last.date_reported.toISOString()}_${last.id}` : null;

  return { items, nextCursor };
}

export async function findById(itemId: string) {
  const { rows } = await pool.query(
    `SELECT i.*,
            u.display_name AS reporter_name,
            COALESCE(json_agg(p ORDER BY p.display_order) FILTER (WHERE p.id IS NOT NULL), '[]') AS photos,
            (SELECT COUNT(*) FROM claims c WHERE c.item_id = i.id) AS claim_count
     FROM items i
     JOIN users u ON u.id = i.reported_by
     LEFT JOIN item_photos p ON p.item_id = i.id
     WHERE i.id = $1
     GROUP BY i.id, u.display_name`,
    [itemId],
  );
  return rows[0] ?? null;
}

export async function create(spaceId: string, userId: string, input: CreateItemInput) {
  const { rows } = await pool.query(
    `INSERT INTO items (space_id, reported_by, type, title, description, category, location_label, date_occurred)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      spaceId,
      userId,
      input.type,
      input.title,
      input.description ?? null,
      input.category,
      input.locationLabel ?? null,
      input.dateOccurred ?? null,
    ],
  );
  return rows[0];
}

export async function addPhotos(
  itemId: string,
  photos: Array<{ url: string; thumbnailUrl: string; order: number }>,
) {
  for (const photo of photos) {
    await pool.query(
      `INSERT INTO item_photos (item_id, url, thumbnail_url, display_order) VALUES ($1, $2, $3, $4)`,
      [itemId, photo.url, photo.thumbnailUrl, photo.order],
    );
  }
}

export async function update(itemId: string, input: UpdateItemInput) {
  const { rows } = await pool.query(
    `UPDATE items SET
       title         = COALESCE($1, title),
       description   = COALESCE($2, description),
       category      = COALESCE($3, category),
       location_label = COALESCE($4, location_label),
       status        = COALESCE($5, status),
       date_occurred = COALESCE($6, date_occurred)
     WHERE id = $7
     RETURNING *`,
    [
      input.title ?? null,
      input.description ?? null,
      input.category ?? null,
      input.locationLabel ?? null,
      input.status ?? null,
      input.dateOccurred ?? null,
      itemId,
    ],
  );
  return rows[0] ?? null;
}

export async function remove(itemId: string) {
  const { rows } = await pool.query(
    'DELETE FROM items WHERE id = $1 RETURNING *',
    [itemId],
  );
  return rows[0] ?? null;
}

export async function getPhotoPublicIds(itemId: string): Promise<string[]> {
  const { rows } = await pool.query(
    'SELECT url FROM item_photos WHERE item_id = $1',
    [itemId],
  );
  return rows.map((r) => r.url);
}
