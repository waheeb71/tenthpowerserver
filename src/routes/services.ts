import { Hono } from 'hono';
import { queryNeon } from '../db/neon.js';

export const servicesRouter = new Hono();

servicesRouter.get('/', async (c) => {
  try {
    const rows = await queryNeon(
      `SELECT * FROM services 
       WHERE is_active = true 
       ORDER BY is_featured DESC, display_order ASC, created_at DESC`
    );

    return c.json({
      success: true,
      data: rows.map((s) => ({
        id: s.id,
        name_ar: s.title_ar || s.name_ar,
        slug: s.slug,
        short_description_ar: s.short_desc_ar || s.short_description_ar || '',
        full_description_ar: s.description_ar || s.full_description_ar || '',
        cover_image_url: s.cover_image_url || '',
        icon: s.icon || 'facade',
        features_ar: s.features_ar || [],
        sort_order: s.display_order ?? s.sort_order ?? 0,
        is_featured: s.is_featured ?? false,
        rating_avg: Number(s.rating_avg) || 5.0,
        review_count: s.review_count || 0,
        price_from: s.price_from ? Number(s.price_from) : null,
      })),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
