import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🚀 Proxying to n8n:', process.env.N8N_INGEST_WEBHOOK_URL);
    
    const n8nUrl = process.env.N8N_INGEST_WEBHOOK_URL;
    if (!n8nUrl) {
       console.error('Missing N8N_INGEST_WEBHOOK_URL');
       return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
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
      console.error('❌ n8n error:', response.status, errorText);
      return NextResponse.json(
          { error: `n8n error: ${response.status}`, details: errorText },
          { status: response.status }
      );
    }

    // Get response text first to safely handle non-JSON
    const dataText = await response.text();
    let data;
    try {
        data = JSON.parse(dataText);
    } catch (e) {
        console.log('✅ n8n response (text):', dataText.substring(0, 100));
        data = { message: dataText };
    }
    
    console.log('✅ n8n response received');
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
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
