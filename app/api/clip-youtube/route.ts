import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🚀 Proxying to n8n clips:', process.env.N8N_CLIP_WEBHOOK_URL);
    
    const n8nUrl = process.env.N8N_CLIP_WEBHOOK_URL;

    if (!n8nUrl) {
      console.error('Missing N8N_CLIP_WEBHOOK_URL environment variable');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ n8n clips error:', response.status, errorText);
      throw new Error(`n8n returned ${response.status}: ${errorText}`);
    }

    const dataText = await response.text();
    let data;
    try {
        data = JSON.parse(dataText);
    } catch (e) {
         // Fallback if response isn't JSON
        data = { message: dataText };
    }

    console.log('✅ n8n clips response received');
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('❌ Clips proxy error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
