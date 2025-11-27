const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  'https://vyx-n8n.onrender.com/webhook/ingest-content'

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
    transcript?: string
    summary?: string
  }
  transcript?: {
    full_text: string
    word_count: number
    character_count: number
  }
  analysis?: {
    summary: string
    key_themes: Array<{
      theme: string
      description: string
    }>
    main_takeaways: string[]
    target_audience: string
    content_tone: string
    primary_keywords: string[]
  }
  content: {
    total_items: number
    successful_images: number
    failed_images: number
    average_scores: {
      virality: number
      usefulness: number
    }
    scoring_summary?: {
      highest_virality: string
      highest_usefulness: string
      overall_quality_avg: number
      recommendations: string[]
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
        engagement?: number
        quality?: number
        seo_discoverability?: number
        overall?: number
      }
      score_reasoning?: string
      improvement_suggestions?: string[]
      best_time_to_post?: string
      estimated_reach?: string
      image_generated: boolean
      image_error: string | null
      generation_status?: string
      generation_time?: string
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
        // 3 minute timeout to give the workflow enough time to complete
        // (transcript extraction + AI processing + image generation typically takes 60-90 seconds)
        // while still avoiding infinite hangs in the UI.
        // @ts-expect-error - AbortSignal.timeout may not be in the TS lib yet
        fetchOptions.signal = AbortSignal.timeout(180_000)
      }

      const response = await fetch(N8N_WEBHOOK_URL, fetchOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = (await response.json()) as N8NResponse
      return data
    } catch (error: any) {
      console.error('N8N API error:', error)

      // Always show a generic error message to users
      throw new Error('Our servers are currently experiencing high traffic. Please try again in a few moments.')
    }
  }

  /**
   * Map UI content-type IDs to the tokens expected by the N8N/OPUS workflow.
   * Valid types: x_post, blog, instagram_reel_script, instagram_post, 
   * linkedin_post, facebook_post, youtube_shorts_script
   */
  static mapContentTypes(selected: string[]): string[] {
    // Content types now match the API directly, so we just pass them through
    // Valid types from API spec:
    const validTypes = [
      'x_post',
      'blog', 
      'instagram_reel_script',
      'instagram_post',
      'linkedin_post',
      'facebook_post',
      'youtube_shorts_script'
    ]
    
    // Filter to only valid types and return
    return selected.filter(type => validTypes.includes(type))
  }
}
