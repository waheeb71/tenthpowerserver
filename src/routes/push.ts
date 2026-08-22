import { Hono } from 'hono';
import { executeNeon } from '../db/neon.js';

export const pushRouter = new Hono();

pushRouter.post('/subscribe', async (c) => {
  try {
    const body = await c.req.json();
    const { token, platform, device_info } = body;

    if (!token) {
      return c.json({ success: false, error: 'Token is required' }, 400);
    }

    const success = await executeNeon(
      `INSERT INTO push_subscriptions (endpoint, auth, p256dh, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (endpoint) DO NOTHING`,
      [token, platform || 'fcm_android', JSON.stringify(device_info || {})]
    );

    return c.json({
      success,
      message: success ? 'Device subscribed successfully' : 'Subscription failed',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
