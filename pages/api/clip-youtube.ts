import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const n8nUrl = process.env.N8N_CLIP_WEBHOOK_URL || 'https://vyx-n8n.onrender.com/webhook/clip-youtube';
    
    console.log('🚀 Proxying to n8n clips (Pages Router):', n8nUrl);

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const dataText = await response.text();
    let data;
    try {
      data = JSON.parse(dataText);
    } catch {
      data = { message: dataText };
    }

    if (!response.ok) {
      console.error('❌ n8n clips error:', response.status, dataText);
      res.status(response.status).json({ error: `n8n error: ${response.status}`, details: data });
      return;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('❌ Clips proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
