export default async (req, context) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  const json = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  };

  const NEON_CONN = process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_d2oRPN7OIcmA@ep-muddy-cloud-axv9ixcc-pooler.c-4.us-east-2.aws.neon.tech/Powerof10?sslmode=require&channel_binding=require';
  const COMPANY_SLUG = process.env.COMPANY_SLUG || 'tenth-power';

  async function queryNeon(sql, params = []) {
    const match = NEON_CONN.match(/@([^/]+)\//);
    const host = match ? match[1] : 'ep-muddy-cloud-axv9ixcc-pooler.c-4.us-east-2.aws.neon.tech';
    const endpoint = `https://${host}/sql`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': NEON_CONN,
      },
      body: JSON.stringify({ query: sql, params }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Neon Error [${res.status}]: ${text}`);
    }

    const data = await res.json();
    return data.rows || [];
  }

  async function executeNeon(sql, params = []) {
    try {
      await queryNeon(sql, params);
      return true;
    } catch (err) {
      console.error('Execute error:', err.message);
      return false;
    }
  }

  try {
    // 1. Health check
    if (pathname === '/' || pathname.endsWith('/api/v1/health') || pathname.endsWith('/health')) {
      return json({
        status: 'online',
        service: 'Tenth Power Edge API Gateway (Netlify Serverless)',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Company Info
    if ((pathname.endsWith('/api/v1/company') || pathname.endsWith('/company')) && req.method === 'GET') {
      const slug = url.searchParams.get('slug') || COMPANY_SLUG;
      const rows = await queryNeon(
        `SELECT * FROM companies WHERE slug = $1 OR slug ILIKE '%tenth%' OR id::text = $1 LIMIT 1`,
        [slug]
      );

      if (rows.length > 0) {
        const c = rows[0];
        return json({
          success: true,
          data: {
            id: c.id,
            name_ar: c.name_ar,
            name_en: c.name_en,
            slug: c.slug,
            description_ar: c.description_ar,
            vision_ar: c.vision_ar,
            mission_ar: c.mission_ar,
            goals_ar: c.goals_ar || [],
            why_us_ar: c.why_us_ar || [],
            logo_url: c.logo_url || '',
            phone_primary: c.phone_primary || '+966532438253',
            whatsapp_number: c.whatsapp_number || '966532438253',
            email: c.email || 'info@tenthpower.com',
            website_url: c.website_url || 'https://powerof10.netlify.app',
            location_ar: c.location_ar || 'المملكة العربية السعودية - الرياض',
            social_links: c.social_links || {
              facebook: 'https://facebook.com/tenthpower.contracting',
              telegram: 'https://t.me/tenthpower',
              instagram: 'https://instagram.com/tenthpower.sa',
              snapchat: 'https://snapchat.com/add/tenthpower.sa',
              tiktok: 'https://tiktok.com/@tenthpower.sa',
            },
          },
        });
      }

      return json({
        success: true,
        data: {
          id: 'tenth-power-sa',
          name_ar: 'القوة العاشرة للمقاولات العامة',
          name_en: 'Tenth Power General Contracting',
          slug: 'tenth-power',
          description_ar: 'مؤسسة وطنية رائدة متخصصة في تنفيذ أرقى أعمال الزجاج، السيكوريت، الألمنيوم، الكلادينج، والستانلس ستيل.',
          vision_ar: 'أن نكون الخيار الهندسي الأول والرواد في تقديم حلول واجهات الزجاج والكلادينج المعمارية المبتكرة في المملكة.',
          mission_ar: 'تقديم أعمال مقاولات وتركيبات زجاجية ذات جودة متناهية تفوق توقعات عملائنا.',
          goals_ar: ['تحقيق أعلى مستويات الأمان والعزل الحراري والصوتي.', 'توفير حلول تصميمية عصرية تلبي متطلبات المشاريع الحديثة.'],
          why_us_ar: ['خبرة متراكمة وأيدي هندسية متخصصة ومحترفة.', 'استخدام قطاعات ألمنيوم وزجاج سيكوريت عالي الجودة.'],
          logo_url: 'assets/icons/app_logo.webp',
          phone_primary: '+966532438253',
          whatsapp_number: '966532438253',
          email: 'info@tenthpower.com',
          website_url: 'https://powerof10.netlify.app',
          location_ar: 'المملكة العربية السعودية - الرياض',
          social_links: {
            facebook: 'https://facebook.com/tenthpower.contracting',
            telegram: 'https://t.me/tenthpower',
            instagram: 'https://instagram.com/tenthpower.sa',
            snapchat: 'https://snapchat.com/add/tenthpower.sa',
            tiktok: 'https://tiktok.com/@tenthpower.sa',
          },
        },
      });
    }

    // 3. Services List
    if ((pathname.endsWith('/api/v1/services') || pathname.endsWith('/services')) && req.method === 'GET') {
      const rows = await queryNeon(
        `SELECT * FROM services WHERE is_active = true ORDER BY is_featured DESC, sort_order ASC, created_at DESC`
      );
      return json({
        success: true,
        data: rows.map((s) => ({
          id: s.id,
          name_ar: s.name_ar || s.title_ar || '',
          slug: s.slug,
          short_description_ar: s.short_description_ar || s.short_desc_ar || '',
          full_description_ar: s.full_description_ar || s.description_ar || '',
          cover_image_url: s.cover_image_url || '',
          icon: s.icon || 'facade',
          features_ar: s.features_ar || [],
          sort_order: s.sort_order ?? 0,
          is_featured: s.is_featured ?? false,
          rating_avg: Number(s.rating_avg) || 5.0,
          review_count: s.review_count || 0,
          price_from: s.price_from ? Number(s.price_from) : null,
        })),
      });
    }

    // 4. Projects List
    if ((pathname.endsWith('/api/v1/projects') || pathname.endsWith('/projects')) && req.method === 'GET') {
      const rows = await queryNeon(
        `SELECT * FROM projects WHERE is_active = true ORDER BY is_featured DESC, created_at DESC`
      );
      return json({
        success: true,
        data: rows.map((p) => ({
          id: p.id,
          title_ar: p.title_ar,
          slug: p.slug,
          description_ar: p.description_ar || '',
          category_ar: p.city || 'واجهات ومباني',
          client_name: p.client_name || 'عميل مميز',
          location_ar: p.location_ar || 'المملكة العربية السعودية',
          cover_image_url: p.cover_image_url || '',
          gallery_images: p.gallery_images || [],
          is_featured: p.is_featured ?? false,
        })),
      });
    }

    // 5. Project Details
    if ((pathname.includes('/api/v1/projects/') || pathname.includes('/projects/')) && req.method === 'GET') {
      const parts = pathname.split('/projects/');
      const id = parts[1]?.trim();
      if (!id) return json({ success: false, error: 'ID is required' }, 400);

      const rows = await queryNeon(
        `SELECT * FROM projects WHERE (id::text = $1 OR slug = $1) AND is_active = true LIMIT 1`,
        [id]
      );
      if (rows.length === 0) {
        return json({ success: false, message: 'Project not found' }, 404);
      }
      const p = rows[0];
      executeNeon(
        `UPDATE projects SET view_count = COALESCE(view_count, 0) + 1 WHERE id::text = $1 OR slug = $1`,
        [id]
      );
      return json({
        success: true,
        data: {
          id: p.id,
          title_ar: p.title_ar,
          slug: p.slug,
          description_ar: p.description_ar || '',
          category_ar: p.city || 'واجهات ومباني',
          client_name: p.client_name || 'عميل مميز',
          location_ar: p.location_ar || 'المملكة العربية السعودية',
          cover_image_url: p.cover_image_url || '',
          gallery_images: p.gallery_images || [],
          is_featured: p.is_featured ?? false,
        },
      });
    }

    // 6. Media Gallery
    if ((pathname.endsWith('/api/v1/gallery') || pathname.endsWith('/gallery')) && req.method === 'GET') {
      const rows = await queryNeon(
        `SELECT id, file_name, original_name, file_url, cdn_url, thumbnail_url, webp_url FROM media_library ORDER BY created_at DESC`
      );
      return json({
        success: true,
        data: rows.map((g) => ({
          id: g.id,
          title_ar: g.original_name || g.file_name || 'صورة من مشاريعنا',
          category_ar: 'واجهات سيكوريت',
          image_url: g.cdn_url || g.file_url || g.webp_url || '',
        })),
      });
    }

    // 7. Advertisements
    if ((pathname.endsWith('/api/v1/ads') || pathname.endsWith('/ads')) && req.method === 'GET') {
      const rows = await queryNeon(
        `SELECT * FROM advertisements WHERE is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()) ORDER BY priority ASC, created_at DESC`
      );
      return json({
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
          display_order: ad.priority ?? 0,
          is_active: ad.is_active ?? true,
        })),
      });
    }

    // 8. Contact & Quote Requests (POST)
    if ((pathname.endsWith('/api/v1/contact') || pathname.endsWith('/contact')) && req.method === 'POST') {
      const payload = await req.json().catch(() => ({}));
      const { name, phone, message, service_type } = payload;

      if (!name || !phone || !message) {
        return json({ success: false, error: 'Name, phone, and message are required' }, 400);
      }

      const subject = service_type
        ? `طلب خدمة: ${service_type} - من: ${name}`
        : `استفسار من تطبيق الجوال - من: ${name}`;

      const content = `الاسم: ${name}\nالجوال: ${phone}\nالخدمة: ${service_type || 'عام'}\nالرسالة: ${message}`;

      const msgSuccess = await executeNeon(
        `INSERT INTO messages (subject, content, type, is_read, created_at) VALUES ($1, $2, 'contact', false, NOW())`,
        [subject, content]
      );

      if (!msgSuccess) {
        return json({ success: false, error: 'Database insert failed' }, 500);
      }

      executeNeon(
        `INSERT INTO users (full_name, phone, source, created_at) VALUES ($1, $2, 'mobile_app', NOW()) ON CONFLICT DO NOTHING`,
        [name, phone]
      );

      if (service_type) {
        executeNeon(
          `INSERT INTO quote_requests (id, company_id, description, status, created_at) VALUES (gen_random_uuid(), (SELECT id FROM companies WHERE slug = $1 OR slug ILIKE '%tenth%' LIMIT 1), $2, 'pending', NOW())`,
          [COMPANY_SLUG, content]
        );
      }

      return json({ success: true, message: 'تم إرسال طلبك بنجاح وسيتواصل معك مهندسونا فوراً.' });
    }

    // 9. Push Subscription (POST)
    if ((pathname.endsWith('/api/v1/push/subscribe') || pathname.endsWith('/push/subscribe')) && req.method === 'POST') {
      const payload = await req.json().catch(() => ({}));
      const { token, platform, device_info } = payload;
      if (!token) return json({ success: false, error: 'Token is required' }, 400);

      const ok = await executeNeon(
        `INSERT INTO push_subscriptions (id, company_id, endpoint, auth, p256dh, is_active, created_at)
         VALUES (gen_random_uuid(), (SELECT id FROM companies WHERE slug = $1 OR slug ILIKE '%tenth%' LIMIT 1), $2, $3, $4, true, NOW())
         ON CONFLICT (endpoint) DO UPDATE SET is_active = true`,
        [COMPANY_SLUG, token, platform || 'fcm_android', JSON.stringify(device_info || {})]
      );
      return json({ success: ok, message: ok ? 'Subscribed' : 'Failed' });
    }

    // 404
    return json({ success: false, error: 'Endpoint not found' }, 404);
  } catch (err) {
    console.error('Server error:', err);
    return json({ success: false, error: err.message }, 500);
  }
};

export const config = {
  path: ['/*', '/api/v1/*'],
};
