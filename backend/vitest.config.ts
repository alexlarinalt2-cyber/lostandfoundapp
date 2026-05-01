import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@laf/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 15000,
    env: {
      DATABASE_URL: 'postgresql://laf_user:laf_password@localhost:5432/lostandfound_test',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'test_jwt_secret_must_be_at_least_32chars_long',
      JWT_EXPIRES_IN: '15m',
      REFRESH_TOKEN_SECRET: 'test_refresh_secret_min_32chars_long_xxx',
      REFRESH_TOKEN_EXPIRES_IN: '7d',
      NODE_ENV: 'test',
      PORT: '4001',
      CLIENT_URL: 'http://localhost:5173',
    },
  },
});
