import { Hono } from 'hono';
import { queryNeon, executeNeon } from '../db/neon.js';

export const projectsRouter = new Hono();

projectsRouter.get('/', async (c) => {
  try {
    const rows = await queryNeon(
      `SELECT * FROM projects 
       WHERE is_active = true 
       ORDER BY is_featured DESC, display_order ASC, created_at DESC`
    );

    return c.json({
      success: true,
      data: rows.map((p) => ({
        id: p.id,
        title_ar: p.title_ar,
        slug: p.slug,
        description_ar: p.description_ar || '',
        category_ar: p.category_ar || 'واجهات ومباني',
        client_name: p.client_name_ar || p.client_name || 'عميل مميز',
        location_ar: p.location_ar || 'المملكة العربية السعودية',
        cover_image_url: p.cover_image_url || '',
        gallery_images: p.gallery_urls || [],
        is_featured: p.is_featured ?? false,
      })),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

projectsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const rows = await queryNeon(
      `SELECT * FROM projects 
       WHERE (id::text = $1 OR slug = $1) AND is_active = true 
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return c.json({ success: false, message: 'Project not found' }, 404);
    }

    const p = rows[0];

    // Increment view count in background
    executeNeon(
      `UPDATE projects SET view_count = COALESCE(view_count, 0) + 1 WHERE id::text = $1 OR slug = $1`,
      [id]
    );

    return c.json({
      success: true,
      data: {
        id: p.id,
        title_ar: p.title_ar,
        slug: p.slug,
        description_ar: p.description_ar || '',
        category_ar: p.category_ar || 'واجهات ومباني',
        client_name: p.client_name_ar || p.client_name || 'عميل مميز',
        location_ar: p.location_ar || 'المملكة العربية السعودية',
        cover_image_url: p.cover_image_url || '',
        gallery_images: p.gallery_urls || [],
        is_featured: p.is_featured ?? false,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
