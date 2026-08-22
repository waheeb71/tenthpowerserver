import { Hono } from 'hono';
import { queryNeon } from '../db/neon.js';

export const adsRouter = new Hono();

adsRouter.get('/', async (c) => {
  try {
    const rows = await queryNeon(
      `SELECT * FROM advertisements 
       WHERE is_active = true 
         AND (start_date IS NULL OR start_date <= NOW()) 
         AND (end_date IS NULL OR end_date >= NOW()) 
       ORDER BY display_order ASC, created_at DESC`
    );

    return c.json({
      success: true,
      data: rows.map((ad) => ({
        id: ad.id,
        title_ar: ad.title_ar,
        subtitle_ar: ad.subtitle_ar || '',
        media_type: ad.media_type || 'image',
        media_url: ad.media_url,
        thumbnail_url: ad.thumbnail_url || null,
        target_route: ad.target_route || null,
        external_url: ad.external_url || null,
        start_date: ad.start_date || null,
        end_date: ad.end_date || null,
        display_order: ad.display_order ?? 0,
        is_active: ad.is_active ?? true,
      })),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
