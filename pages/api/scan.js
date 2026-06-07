import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, latitude, longitude } = req.body;

  const deviceInfo = req.headers['user-agent'] || 'Unknown device';

  const { error } = await supabase.from('scans').insert([
    {
      tag_code: code,
      latitude,
      longitude,
      device_info: deviceInfo
    }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const message =
`🚨 REUNITE ALERT

Tag: ${code}

Location:
https://maps.google.com/?q=${latitude},${longitude}

Latitude: ${latitude}
Longitude: ${longitude}`;

  try {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message
        })
      }
    );
  } catch (e) {
    console.error(e);
  }

  return res.status(200).json({ success: true });
}
