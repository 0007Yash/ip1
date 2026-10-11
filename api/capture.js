api/capture.js (in same repo root):
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
  if (!WEBHOOK_URL) return res.status(500).json({ error: 'Webhook not configured' });

  try {
    const { embeds, attachments, username } = req.body;
    
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify({ embeds, username }));
    
    if (attachments?.[0]?.base64) {
      const buffer = Buffer.from(attachments[0].base64, 'base64');
      const blob = new Blob([buffer], { type: attachments[0].content_type || 'image/jpeg' });
      formData.append('file', blob, attachments[0].filename || 'capture.jpg');
    }

    const discordRes = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    if (!discordRes.ok) {
      const txt = await discordRes.text();
      throw new Error(`Discord ${discordRes.status}: ${txt}`);
    }

    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Capture proxy error:', e);
    res.status(500).json({ error: e.message });
  }
}
vercel.json:
{
  "functions": {
    "api/capture.js": { "maxDuration": 30 }
  }
}
