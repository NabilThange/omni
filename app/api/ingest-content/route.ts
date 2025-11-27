import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔵 API Route Hit: /api/ingest-content');
  
  try {
    const body = await request.json();
    const n8nUrl = process.env.N8N_INGEST_WEBHOOK_URL || 'https://vyx-n8n.onrender.com/webhook/ingest-content';
    
    console.log(`🚀 Proxying to: ${n8nUrl}`);

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    const dataText = await response.text();
    
    console.log(`✅ n8n Status: ${response.status}`);

    let data;
    try {
      data = JSON.parse(dataText);
    } catch {
      data = { message: dataText };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `n8n error: ${response.status}`, details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('❌ Proxy Fatal Error:', error);
    return NextResponse.json(
      { error: 'Internal Proxy Error', details: error.message },
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
