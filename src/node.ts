import 'dotenv/config';
import { serve } from '@hono/node-server';
import { app } from './index.js';

const port = Number(process.env.PORT) || 8787;

console.log(`🚀 Tenth Power API Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
