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
