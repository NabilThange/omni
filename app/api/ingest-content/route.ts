import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Use server-side env var for the actual n8n URL
    const n8nUrl = process.env.N8N_INGEST_WEBHOOK_URL;
    
    if (!n8nUrl) {
      console.error('Missing N8N_INGEST_WEBHOOK_URL environment variable');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get response text (handles both JSON and plain text responses)
    const data = await response.text();
    
    // Try to parse JSON, otherwise return text
    try {
        const jsonData = JSON.parse(data);
        return NextResponse.json(jsonData, { status: response.status });
    } catch {
        return new NextResponse(data, { status: response.status });
    }

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}
