import { Hono } from 'hono';
import { executeNeon } from '../db/neon.js';

export const contactRouter = new Hono();

contactRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, phone, message, service_type } = body;

    if (!name || !phone || !message) {
      return c.json(
        { success: false, error: 'Name, phone, and message are required' },
        400
      );
    }

    const subject = service_type
      ? `طلب خدمة: ${service_type} - من: ${name}`
      : `استفسار من تطبيق الجوال - من: ${name}`;

    const content = `الاسم: ${name}\nالجوال: ${phone}\nالخدمة: ${service_type || 'عام'}\nالرسالة: ${message}`;

    // 1. Insert into messages table
    const msgSuccess = await executeNeon(
      `INSERT INTO messages (subject, content, type, is_read, created_at)
       VALUES ($1, $2, 'contact', false, NOW())`,
      [subject, content]
    );

    if (!msgSuccess) {
      return c.json({ success: false, error: 'Failed to record message' }, 500);
    }

    // 2. Register / Update user lead
    executeNeon(
      `INSERT INTO users (full_name, phone, source, created_at)
       VALUES ($1, $2, 'mobile_app', NOW())
       ON CONFLICT DO NOTHING`,
      [name, phone]
    );

    // 3. Insert into quote_requests if service specified
    if (service_type) {
      executeNeon(
        `INSERT INTO quote_requests (description, status, created_at)
         VALUES ($1, 'pending', NOW())`,
        [content]
      );
    }

    return c.json({
      success: true,
      message: 'تم إرسال طلبك بنجاح وسيتواصل معك مهندسونا فوراً.',
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
