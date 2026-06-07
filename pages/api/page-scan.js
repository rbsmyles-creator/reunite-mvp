import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  const deviceInfo = req.headers['user-agent'] || 'Unknown device';

  await supabase.from('scans').insert([
    {
      tag_code: code,
      device_info: deviceInfo
    }
  ]);

  const message =
`🚨 REUNITE SCAN ALERT

Tag: ${code}

The emergency page was opened.

No GPS location yet.`;

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message
      })
    }
  );

  return res.status(200).json({ success: true });
}
