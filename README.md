# Tenth Power - Edge API Server

بوابة API آمنة تعمل كـ Cloudflare Worker أو Node.js Server، تربط تطبيق الجوال بقاعدة بيانات Neon PostgreSQL دون الكشف عن أي بيانات سرية.

## 🚀 الميزات

- Edge Runtime متوافق مع Cloudflare Workers
- تشغيل محلي بـ Node.js بدون أي تبعيات خارجية
- نقاط API كاملة للتطبيق المحمول
- CORS محمي ومتحكم به

## 📡 نقاط الـ API

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/v1/health` | فحص صحة السيرفر |
| GET | `/api/v1/company` | بيانات المؤسسة والتواصل الاجتماعي |
| GET | `/api/v1/services` | قائمة الخدمات النشطة |
| GET | `/api/v1/projects` | قائمة المشاريع |
| GET | `/api/v1/projects/:id` | تفاصيل مشروع بعينه |
| GET | `/api/v1/gallery` | مكتبة الصور والوسائط |
| GET | `/api/v1/ads` | الإعلانات النشطة |
| POST | `/api/v1/contact` | إرسال طلب عرض سعر |
| POST | `/api/v1/push/subscribe` | تسجيل جهاز للإشعارات |

## Setup

### 1. نسخ ملف البيئة

```bash
cp .env.example .env
```

ثم عدّل `.env` بإضافة قيمة `NEON_DATABASE_URL` الخاصة بك.

### 2. تشغيل محلياً

```bash
node server.mjs
```

السيرفر يعمل على `http://localhost:8787`

### 3. النشر على Cloudflare Workers

```bash
npm install
npx wrangler login
npx wrangler deploy
```

ثم أضف المتغير السري في لوحة Cloudflare:
```bash
npx wrangler secret put NEON_DATABASE_URL
```

## الأمان

- ملف `.env` مستثنى من Git تلقائياً
- لا يُكشف عن بيانات قاعدة البيانات في أي حال
- يجب ضبط CORS في الإنتاج لقبول طلبات التطبيق فقط
