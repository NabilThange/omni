import { NextRequest, NextResponse } from 'next/server'

const N8N_CLIPS_WEBHOOK = process.env.NEXT_PUBLIC_CLIP_YOUTUBE_WEBHOOK || 'https://vyx-n8n.onrender.com/webhook/clip-youtube'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.youtube_url) {
      return NextResponse.json(
        { error: true, message: 'Missing youtube_url parameter' },
        { status: 400 }
      )
    }

    // Forward request to n8n webhook
    const response = await fetch(N8N_CLIPS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtube_url: body.youtube_url,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('N8N webhook error:', response.status, errorText)
      return NextResponse.json(
        { error: true, message: `Server error: ${response.status}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type')
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.log('N8N webhook response not JSON:', text)
      data = {}
    }
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Clips API error:', error)
    return NextResponse.json(
      { error: true, message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
