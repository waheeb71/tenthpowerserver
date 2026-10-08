import { Hono } from 'hono';
import { queryNeon } from '../db/neon.js';

export const galleryRouter = new Hono();

galleryRouter.get('/', async (c) => {
  try {
    const rows = await queryNeon(
      `SELECT
         ml.id,
         ml.cdn_url,
         ml.webp_url,
         ml.file_url,
         ml.category,
         mm.title_ar,
         mm.alt_ar AS alt_text_ar
       FROM media_library ml
       LEFT JOIN media_metadata mm ON mm.media_id = ml.id
       WHERE ml.is_public = true
       ORDER BY ml.created_at DESC`
    );

    return c.json({
      success: true,
      data: rows.map((g) => ({
        id: g.id,
        title_ar: g.title_ar?.trim() || '',
        category_ar: g.category?.trim() || '',
        image_url: g.cdn_url || g.webp_url || g.file_url || '',
      })),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
