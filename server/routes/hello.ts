import { Hono } from 'hono';

const hello = new Hono();

hello.get('/', (c) => {
  return c.text('Hello World');
});

export default hello;
