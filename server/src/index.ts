import { Hono } from 'hono';
import hello from './routes/hello';

const app = new Hono();

// ルートを登録
app.route('/', hello);

const port = process.env.PORT || 3000;

console.log(`Server is running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
