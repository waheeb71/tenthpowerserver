const TELEGRAM_TOKEN = '8955032327:AAF2Uehcl6-cRr3MfIckeoLuFrRjyqO9bdo';
const TELEGRAM_ADMINS = ['123456789', '5887234832'];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function testTelegram() {
  console.log('Testing Telegram Bot notification...');
  const time = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
  const text = 
`🔔 <b>طلب عرض سعر جديد من التطبيق</b> 🏗️
━━━━━━━━━━━━━━━━━━━
👤 <b>الاسم:</b> مهندس وهيب
📱 <b>الجوال:</b> <code>+966532438253</code>
🏢 <b>الخدمة:</b> واجهات زجاج سيكوريت واستركشر
📝 <b>تفاصيل الطلب:</b>
طلب تسعير وتركيب واجهات زجاجية لبرج تجاري بمساحة 650 متر مربع
━━━━━━━━━━━━━━━━━━━
🕒 <b>الوقت:</b> ${time}
📱 <b>المصدر:</b> تطبيق الجوال (Tenth Power App)`;

  for (const chatId of TELEGRAM_ADMINS) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json();
      console.log(`Telegram send result for ${chatId}:`, data);
    } catch (e) {
      console.error(`Failed for ${chatId}:`, e.message);
    }
  }
}

testTelegram();
