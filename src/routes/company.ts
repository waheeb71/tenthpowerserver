import { Hono } from 'hono';
import { queryNeon } from '../db/neon.js';

export const companyRouter = new Hono();

companyRouter.get('/', async (c) => {
  try {
    const slug = c.req.query('slug') || process.env.COMPANY_SLUG || 'tenth-power';
    const rows = await queryNeon(
      `SELECT * FROM companies WHERE slug = $1 OR id::text = $1 LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      return c.json({
        success: true,
        data: {
          id: 'tenth-power-sa',
          name_ar: 'القوة العاشرة للمقاولات العامة',
          name_en: 'Tenth Power General Contracting',
          slug: 'tenth-power',
          description_ar:
            'مؤسسة وطنية رائدة متخصصة في تنفيذ أرقى أعمال الزجاج، السيكوريت، الألمنيوم، الكلادينج، والستانلس ستيل.',
          vision_ar:
            'أن نكون الخيار الهندسي الأول والرواد في تقديم حلول واجهات الزجاج والكلادينج المعمارية المبتكرة في المملكة.',
          mission_ar:
            'تقديم أعمال مقاولات وتركيبات زجاجية ذات جودة متناهية تفوق توقعات عملائنا.',
          goals_ar: [
            'تحقيق أعلى مستويات الأمان والعزل الحراري والصوتي في كافة الواجهات.',
            'توفير حلول تصميمية عصرية تلبي متطلبات المشاريع الحديثة والتجارية.',
            'الالتزام بالمواعيد المحددة والتنفيذ بدقة هندسية متناهية.',
            'تقديم خدمات صيانة وضمان شاملة لكافة المشاريع المنفذة.'
          ],
          why_us_ar: [
            'خبرة متراكمة وأيدي هندسية متخصصة ومحترفة.',
            'استخدام قطاعات ألمنيوم وزجاج سيكوريت عالي الجودة والمواصفات.',
            'إكسسوارات ومفصلات أوروبية فاخرة ومقاومة للصدأ والعوامل الجوية.',
            'أسعار تنافسية وضمانات معتمدة على كافة أعمال التركيب.'
          ],
          logo_url: 'https://pub-e9788e46474044d585e2622e2c6ce74d.r2.dev/company/logo.png',
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
            tiktok: 'https://tiktok.com/@tenthpower.sa'
          }
        }
      });
    }

    const company = rows[0];
    return c.json({
      success: true,
      data: {
        id: company.id,
        name_ar: company.name_ar,
        name_en: company.name_en,
        slug: company.slug,
        description_ar: company.description_ar,
        vision_ar: company.vision_ar,
        mission_ar: company.mission_ar,
        goals_ar: company.goals_ar || [],
        why_us_ar: company.why_us_ar || [],
        logo_url: company.logo_url || '',
        phone_primary: company.phone_primary || '+966532438253',
        whatsapp_number: company.whatsapp_number || '966532438253',
        email: company.email || 'info@tenthpower.com',
        website_url: company.website_url || 'https://powerof10.netlify.app',
        location_ar: company.location_ar || 'المملكة العربية السعودية - الرياض',
        social_links: company.social_links || {
          facebook: 'https://facebook.com/tenthpower.contracting',
          telegram: 'https://t.me/tenthpower',
          instagram: 'https://instagram.com/tenthpower.sa',
          snapchat: 'https://snapchat.com/add/tenthpower.sa',
          tiktok: 'https://tiktok.com/@tenthpower.sa'
        }
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
