'use client'

import { useState, useRef, useCallback } from 'react'
import { ProcessingModal } from '@/components/ProcessingModal'
import { Download, Copy, Check, ChevronDown, ChevronUp, Play, Clock, Star, FileVideo, AlertCircle, RefreshCw, X } from 'lucide-react'

// API response types
interface ClipCaption {
  type: string
  text: string
  hashtags: string[]
}

interface Clip {
  clip_id: string
  index: number
  title: string
  description: string
  duration: number
  start_time: string
  end_time: string
  video_url: string
  thumbnail_url: string
  captions: ClipCaption[]
  recommended_caption: string
  virality_score: number
  file_size: number
  processed_at: string
}

interface Top3Clip {
  title: string
  video_url: string
  caption: string
  score: number
}

interface ClipsApiResponse {
  success: boolean
  timestamp: string
  source_video: {
    id: string
    url: string
  }
  summary: {
    total_clips: number
    average_score: number
    total_duration: number
  }
  clips: Clip[]
  top_3: Top3Clip[]
  meta: {
    cost: string
    powered_by: string
  }
  error?: boolean
  message?: string
}

const API_ENDPOINT = 'https://omni-n8n.up.railway.app/webhook/clip-youtube'
const TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes

// YouTube URL validation
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/
  return youtubeRegex.test(url)
}

// Format duration in seconds to MM:SS
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format file size to human readable
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Clip Card Component
function ClipCard({ clip, isTop3 = false }: { clip: Clip; isTop3?: boolean }) {
  const [copied, setCopied] = useState(false)
  const [showCaptions, setShowCaptions] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  const handleCopyCaption = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setCopyFailed(false)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyFailed(true)
      // Fallback: select text in a textarea
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setCopyFailed(false)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Show fallback UI - copyFailed remains true
      }
      document.body.removeChild(textarea)
    }
  }

  const handleDownload = async () => {
    // Open in new tab to trigger download
    window.open(clip.video_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all ${
        isTop3 ? 'border-2' : 'border'
      }`}
      style={{
        backgroundColor: 'white',
        borderColor: isTop3 ? 'var(--color-primary-action)' : 'var(--color-border-lighter)',
      }}
      role="article"
      aria-label={`Clip: ${clip.title}`}
    >
      {/* Thumbnail / Video Preview */}
      <div className="relative aspect-video bg-black">
        {showVideoPlayer ? (
          <>
            <video
              src={clip.video_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
              aria-label={`Video player for ${clip.title}`}
            />
            <button
              onClick={() => setShowVideoPlayer(false)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
              aria-label="Close video player"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {clip.thumbnail_url ? (
              <img
                src={clip.thumbnail_url}
                alt={`Thumbnail for ${clip.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <FileVideo className="w-12 h-12 text-gray-500" aria-hidden="true" />
              </div>
            )}
            {/* Score Badge */}
            <div
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
              style={{
                backgroundColor: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(4px)',
              }}
              aria-label={`Virality score: ${clip.virality_score}`}
            >
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" aria-hidden="true" />
              <span className="text-white text-sm font-semibold">{clip.virality_score}</span>
            </div>
            {/* Duration Badge */}
            <div
              className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: 'rgba(0,0,0,0.75)',
                color: 'white',
              }}
              aria-label={`Duration: ${formatDuration(clip.duration)}`}
            >
              {formatDuration(clip.duration)}
            </div>
            {/* Play overlay for video */}
            <button
              onClick={() => setShowVideoPlayer(true)}
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              aria-label={`Play ${clip.title}`}
            >
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-900 ml-1" aria-hidden="true" />
              </div>
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold text-lg mb-1 line-clamp-2"
          style={{
            fontFamily: 'var(--font-figtree), Figtree',
            color: 'var(--color-text-primary)',
          }}
        >
          {clip.title}
        </h3>
        <p
          className="text-sm mb-3 line-clamp-2"
          style={{
            fontFamily: 'var(--font-figtree), Figtree',
            color: 'var(--color-text-secondary)',
          }}
        >
          {clip.description}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(clip.duration)}
          </span>
          <span className="flex items-center gap-1">
            <FileVideo className="w-3.5 h-3.5" />
            {formatFileSize(clip.file_size)}
          </span>
        </div>

        {/* Recommended Caption */}
        <div
          className="p-3 rounded-lg mb-3"
          style={{ backgroundColor: 'var(--color-bg-light)' }}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Recommended Caption
            </span>
            <button
              onClick={() => handleCopyCaption(clip.recommended_caption)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
              style={{
                backgroundColor: copied ? 'var(--color-success)' : 'var(--color-primary-action)',
                color: 'white',
              }}
              aria-label="Copy caption to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <p
            className="text-sm"
            style={{
              fontFamily: 'var(--font-figtree), Figtree',
              color: 'var(--color-text-primary)',
            }}
          >
            {clip.recommended_caption}
          </p>
          {copyFailed && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-warning-text)' }}>
              Couldn't copy automatically. Please select and copy manually.
            </p>
          )}
        </div>

        {/* Alternative Captions Expand */}
        {clip.captions && clip.captions.length > 1 && (
          <div className="mb-4">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: 'var(--color-primary-action)' }}
              aria-expanded={showCaptions}
              aria-label={showCaptions ? 'Hide alternative captions' : 'Show alternative captions'}
            >
              {showCaptions ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Hide alternatives
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> {clip.captions.length - 1} more caption{clip.captions.length > 2 ? 's' : ''}
                </>
              )}
            </button>
            {showCaptions && (
              <div className="mt-2 space-y-2">
                {clip.captions
                  .filter((c) => c.text !== clip.recommended_caption)
                  .map((caption, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg flex items-start justify-between gap-2"
                      style={{ backgroundColor: 'var(--color-bg-lighter)' }}
                    >
                      <div>
                        <span
                          className="text-xs font-medium capitalize"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {caption.type}
                        </span>
                        <p
                          className="text-sm mt-0.5"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {caption.text}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyCaption(caption.text)}
                        className="flex-shrink-0 p-1.5 rounded transition-colors"
                        style={{ color: 'var(--color-primary-action)' }}
                        aria-label={`Copy ${caption.type} caption`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          style={{
            fontFamily: 'var(--font-figtree), Figtree',
            backgroundColor: 'var(--color-primary-action)',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-action-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-action)'
          }}
          aria-label={`Download ${clip.title}`}
        >
          <Download className="w-4 h-4" />
          Download Clip
        </button>
      </div>
    </div>
  )
}

// Main Page Component
export default function ClipsPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [result, setResult] = useState<ClipsApiResponse | null>(null)
  const [isTimedOut, setIsTimedOut] = useState(false)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setValidationError('')
      return
    }
    if (!isValidYouTubeUrl(url)) {
      setValidationError('Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)')
    } else {
      setValidationError('')
    }
  }

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsProcessing(false)
    setError('Request cancelled.')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL')
      return
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      setError('Please enter a valid YouTube URL')
      return
    }

    setError('')
    setValidationError('')
    setIsProcessing(true)
    setIsTimedOut(false)
    setResult(null)

    // Create AbortController for cancellation
    abortControllerRef.current = new AbortController()

    // Set up timeout
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      setIsTimedOut(true)
      setIsProcessing(false)
      setError('Request timed out after 10 minutes. The video may be too long or the server is busy. Please try again.')
    }, TIMEOUT_MS)

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url: youtubeUrl,
        }),
        signal: abortControllerRef.current.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data: ClipsApiResponse = await response.json()

      if (data.error || !data.success) {
        setError(data.message || 'Failed to generate clips. Please try again.')
        setIsProcessing(false)
        return
      }

      setResult(data)
    } catch (err: any) {
      clearTimeout(timeoutId)
      
      if (err.name === 'AbortError') {
        if (!isTimedOut) {
          setError('Request was cancelled.')
        }
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    setError('')
    setIsTimedOut(false)
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  const handleReset = () => {
    setResult(null)
    setYoutubeUrl('')
    setError('')
  }

  return (
    <>
      <ProcessingModal open={isProcessing} onCancel={handleCancel} estimatedTime="2–5 min" />

      <main className="min-h-screen bg-white">
        {/* Results View */}
        {result && result.success ? (
          <div className="pb-16">
            {/* Results Header */}
            <div
              className="py-8 px-4 mb-8"
              style={{ backgroundColor: 'var(--color-bg-light)' }}
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h1
                      className="text-3xl md:text-4xl font-bold mb-2"
                      style={{
                        fontFamily: 'var(--font-figtree), Figtree',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      Your Clips Are Ready! 🎬
                    </h1>
                    <p
                      className="text-base"
                      style={{
                        fontFamily: 'var(--font-figtree), Figtree',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      Generated from: {result.source_video.url}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors self-start"
                    style={{
                      backgroundColor: 'var(--color-bg-lighter)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-light)',
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate New Clips
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'white', border: '1px solid var(--color-border-lighter)' }}
                  >
                    <p
                      className="text-sm mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Total Clips
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: 'var(--color-primary-action)' }}
                    >
                      {result.summary.total_clips}
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'white', border: '1px solid var(--color-border-lighter)' }}
                  >
                    <p
                      className="text-sm mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Average Virality Score
                    </p>
                    <p
                      className="text-3xl font-bold flex items-center gap-2"
                      style={{ color: 'var(--color-primary-action)' }}
                    >
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      {result.summary.average_score}
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: 'white', border: '1px solid var(--color-border-lighter)' }}
                  >
                    <p
                      className="text-sm mb-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Total Duration
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: 'var(--color-primary-action)' }}
                    >
                      {formatDuration(result.summary.total_duration)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 Section */}
            {result.top_3 && result.top_3.length > 0 && (
              <div className="max-w-6xl mx-auto px-4 mb-12">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  ⭐ Top 3 Clips
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.clips
                    .filter((clip) =>
                      result.top_3.some((t) => t.video_url === clip.video_url)
                    )
                    .slice(0, 3)
                    .map((clip) => (
                      <ClipCard key={clip.clip_id} clip={clip} isTop3 />
                    ))}
                </div>
              </div>
            )}

            {/* All Clips Section */}
            <div className="max-w-6xl mx-auto px-4">
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-figtree), Figtree',
                  color: 'var(--color-text-primary)',
                }}
              >
                All Clips ({result.clips.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.clips.map((clip) => (
                  <ClipCard key={clip.clip_id} clip={clip} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Form View */
          <div className="pt-16 pb-16">
            <div className="max-w-3xl mx-auto px-8">
              {/* Header */}
              <div className="mb-12">
                <h1
                  className="text-5xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Generate Video Clips
                </h1>
                <p
                  className="text-lg"
                  style={{
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Paste a YouTube URL and our AI will automatically extract the most
                  engaging moments, add subtitles, and generate viral-ready captions
                  for each clip.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* YouTube URL Input */}
                <div>
                  <label
                    htmlFor="youtubeUrl"
                    className="block text-sm font-semibold mb-3"
                    style={{
                      fontFamily: 'var(--font-figtree), Figtree',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    YouTube URL
                  </label>
                  <input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value)
                      validateUrl(e.target.value)
                    }}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: 'var(--font-figtree), Figtree',
                      borderColor: validationError
                        ? '#f87171'
                        : 'var(--color-border-lighter)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow =
                        '0 0 0 2px var(--color-primary-action)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    aria-describedby={validationError ? 'url-error' : undefined}
                    aria-invalid={!!validationError}
                  />
                  {validationError && (
                    <p
                      id="url-error"
                      className="mt-2 text-sm flex items-center gap-1"
                      style={{ color: '#f87171' }}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {validationError}
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div
                  className="p-4 border rounded-lg"
                  style={{
                    backgroundColor: 'rgba(9, 136, 240, 0.1)',
                    borderColor: 'var(--color-primary-action)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-figtree), Figtree',
                      color: 'var(--color-primary-action)',
                    }}
                  >
                    <strong>⏱️ Processing takes 2–5 minutes.</strong> We'll download
                    your video, analyze the transcript, identify highlights, render
                    clips with subtitles, and generate captions.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    className="p-4 border rounded-lg"
                    style={{
                      backgroundColor: '#fee2e2',
                      borderColor: '#f87171',
                      color: '#b91c1c',
                    }}
                    role="alert"
                    aria-live="assertive"
                  >
                    <p
                      className="flex items-start gap-2"
                      style={{
                        fontFamily: 'var(--font-figtree), Figtree',
                        margin: 0,
                      }}
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {error}
                    </p>
                    {/* Show retry button for all errors, not just timeout */}
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      style={{
                        backgroundColor: '#b91c1c',
                        color: 'white',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#991b1b'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#b91c1c'
                      }}
                    >
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !youtubeUrl.trim() || !!validationError}
                  className="w-full text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: 'var(--font-figtree), Figtree',
                    backgroundColor: 'var(--color-primary-action)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor =
                        'var(--color-primary-action-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor =
                        'var(--color-primary-action)'
                    }
                  }}
                  aria-label="Generate video clips"
                >
                  {isProcessing ? 'Processing...' : 'Generate Clips'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
