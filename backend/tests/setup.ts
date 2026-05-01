import { pool } from '../src/config/db';
import { redis } from '../src/config/redis';

beforeAll(async () => {
  if (!redis.isOpen) await redis.connect();
});

afterEach(async () => {
  await pool.query(`
    TRUNCATE notifications, claims, item_photos, items,
             space_memberships, spaces, users
    RESTART IDENTITY CASCADE
  `);
  await redis.flushDb();
});

afterAll(async () => {
  await pool.end();
  await redis.quit();
});
