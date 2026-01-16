import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello World');
});

const port = process.env.PORT || 3000;

console.log(`Server is running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
