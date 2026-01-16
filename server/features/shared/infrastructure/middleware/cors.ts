import { cors } from 'hono/cors';

/**
 * CORSミドルウェア
 * フロントエンドからのアクセスを許可
 */
export const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || '*', // 開発環境ではすべてのオリジンを許可
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
