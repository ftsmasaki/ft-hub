import { Hono } from 'hono';
import hello from './routes/hello';
import transcription from './routes/transcription';
import { corsMiddleware } from './features/shared/infrastructure/middleware/cors';
import { errorHandler } from './features/shared/infrastructure/middleware/error-handler';

const app = new Hono();

// デバッグ: すべてのリクエストをログ出力（最初に登録）
app.use('*', async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  console.log(`[${new Date().toISOString()}] Headers:`, Object.fromEntries(c.req.raw.headers.entries()));
  await next();
});

// ミドルウェアを適用
app.use('*', corsMiddleware);
app.use('*', errorHandler);

// ルートを登録
app.route('/', hello);
app.route('/', transcription);

const port = process.env.PORT || 3000;

console.log(`Server is running on http://localhost:${port}`);
console.log('Registered routes:');
console.log('  GET  /');
console.log('  POST /api/transcription');

export default {
  port,
  fetch: app.fetch,
};
