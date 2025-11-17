const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  'http://localhost:5678/webhook/ingest-content'

export interface N8NRequest {
  videoUrl: string
  contentTypes: string[]
}

export interface N8NResponse {
  success: boolean
  timestamp: string
  video: {
    id: string
    url: string
    title: string
    channel: string
  }
  content: {
    total_items: number
    successful_images: number
    failed_images: number
    average_scores: {
      virality: number
      usefulness: number
    }
    items: Array<{
      id: string
      content_type: string
      content: string
      image_url?: string
      image_base64?: string
      image_prompt: string
      aspect_ratio: string
      scores: {
        virality: number
        usefulness: number
      }
      image_generated: boolean
      image_error: string | null
      processed_at: string
    }>
  }
  metadata: {
    workflow_version: string
    powered_by: string
    opus_job_id: string
  }
}

export class N8NClient {
  static isValidYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/
    return youtubeRegex.test(url)
  }

  static async generateContent(videoUrl: string, contentTypes: string[]): Promise<N8NResponse> {
    if (!this.isValidYouTubeUrl(videoUrl)) {
      throw new Error('Invalid YouTube URL format')
    }

    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          contentTypes,
        }),
      }

      // Browser support for AbortSignal.timeout is good in modern environments.
      // If it's unavailable, we just skip the explicit timeout and rely on default behaviour.
      if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
        // 5 minute timeout to give the workflow enough time to complete
        // (transcript extraction + OPUS processing + image generation can take 2-4 minutes)
        // while still avoiding infinite hangs in the UI.
        // @ts-expect-error - AbortSignal.timeout may not be in the TS lib yet
        fetchOptions.signal = AbortSignal.timeout(300_000)
      }

      const response = await fetch(N8N_WEBHOOK_URL, fetchOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = (await response.json()) as N8NResponse
      return data
    } catch (error: any) {
      console.error('N8N API error:', error)

      // Normalize timeout-like errors so the UI can show a friendly message
      if (error?.name === 'TimeoutError' || /timeout/i.test(String(error?.message))) {
        throw new Error('Request timed out while waiting for N8N to finish processing.')
      }

      throw error
    }
  }

  /**
   * Map UI content-type IDs to the tokens expected by the N8N/OPUS workflow.
   * This keeps the UI flexible while the backend receives stable identifiers.
   */
  static mapContentTypes(selected: string[]): string[] {
    const mapping: Record<string, string> = {
      // Existing UI IDs
      'blog-post': 'blog',
      'linkedin-post': 'linkedin',
      'x-post': 'x',
      'instagram-post': 'instagram',
      'image-only': 'image',

      // Future / alternative IDs mentioned in the spec
      'facebook-post': 'facebook',
      'facebook': 'facebook',
      'instagram-reel-script': 'video_script',
      'instagram-reel': 'video_script',
      'video-script': 'video_script',
      'video_script': 'video_script',
    }

    return selected.map((type) => mapping[type] ?? type)
  }
}
