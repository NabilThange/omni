'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProcessingModal } from '@/components/ProcessingModal'
import { ChevronDown } from 'lucide-react'

const CONTENT_TYPES = [
  { id: 'blog', label: 'Blog Post', icon: '📝' },
  { id: 'linkedin_post', label: 'LinkedIn Post', icon: '💼' },
  { id: 'x_post', label: 'X (Twitter) Post', icon: '𝕏' },
  { id: 'instagram_post', label: 'Instagram Post', icon: '📸' },
  { id: 'instagram_reel_script', label: 'Instagram Reel Script', icon: '🎬' },
  { id: 'facebook_post', label: 'Facebook Post', icon: '📘' },
  { id: 'youtube_shorts_script', label: 'YouTube Shorts Script', icon: '▶️' },
]

function isValidYouTubeUrl(url: string) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/
  return youtubeRegex.test(url)
}

export default function UploadPage() {
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [itemsPerType, setItemsPerType] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedTypes, setExpandedTypes] = useState(false)
  const [error, setError] = useState('')

  const handleTypeChange = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    )
  }

  const handleCancel = () => {
    setIsSubmitting(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoUrl.trim()) {
      setError('Please enter a video URL')
      return
    }

    if (selectedTypes.length === 0) {
      setError('Please select at least one content type')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      if (!isValidYouTubeUrl(videoUrl)) {
        throw new Error('Please enter a valid YouTube URL')
      }

      // Direct call to N8N webhook (no backend proxy needed - CORS already enabled)
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_INGEST_WEBHOOK || 'https://n8n-render-tpfk.onrender.com/webhook-test/ingest-content'
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          contentTypes: selectedTypes
        }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Store response in sessionStorage instead of URL to avoid URI_TOO_LONG error
        sessionStorage.setItem('vyx_content_result', JSON.stringify(data))
        router.push('/results')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content'
      setError(errorMessage)
      console.error('Content generation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ProcessingModal open={isSubmitting} onCancel={handleCancel} />

      <main className="min-h-screen bg-white pt-16 pb-16">
        <div className="max-w-3xl mx-auto px-8">
          {/* Header */}
          <div className="mb-12">
            <h1
              className="text-5xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-figtree), Figtree',
                color: 'var(--color-text-primary)'
              }}
            >
              Repurpose Your Video
            </h1>
            <p
              className="text-lg"
              style={{ 
                fontFamily: 'var(--font-figtree), Figtree',
                color: 'var(--color-text-secondary)'
              }}
            >
              Paste your YouTube or video URL below, select which content types you want to generate, and our AI will create optimized content for each platform.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Video URL Input */}
            <div>
              <label
                htmlFor="videoUrl"
                className="block text-sm font-semibold mb-3"
                style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  color: 'var(--color-text-primary)'
                }}
              >
                Video URL
              </label>
              <input
                id="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  borderColor: 'var(--color-border-lighter)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-primary-action)`}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              />
            </div>

            {/* Content Types Selection */}
            <div>
              <label className="block text-sm font-semibold mb-4"
                style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  color: 'var(--color-text-primary)'
                }}
              >
                Select Content Types to Generate
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CONTENT_TYPES.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center p-4 border rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                    style={{ 
                      borderColor: 'var(--color-border-lighter)',
                      opacity: isSubmitting ? 0.5 : 1,
                      pointerEvents: isSubmitting ? 'none' : 'auto'
                    }}
                    onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = 'var(--color-bg-light)')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => handleTypeChange(type.id)}
                      disabled={isSubmitting}
                      className="w-5 h-5 rounded cursor-pointer"
                      style={{ accentColor: 'var(--color-primary-action)' }}
                    />
                    <span className="ml-3" style={{ 
                      fontFamily: 'var(--font-figtree), Figtree',
                      color: 'var(--color-text-primary)'
                    }}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Items Per Type */}
            <div>
              <label
                htmlFor="itemsPerType"
                className="block text-sm font-semibold mb-3"
                style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  color: 'var(--color-text-primary)'
                }}
              >
                Number of Items Per Type
              </label>
              <select
                id="itemsPerType"
                value={itemsPerType}
                onChange={(e) => setItemsPerType(Number(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  borderColor: 'var(--color-border-lighter)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} item{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            {selectedTypes.length > 0 && (
              <div className="p-4 border rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(9, 136, 240, 0.1)',
                  borderColor: 'var(--color-primary-action)'
                }}
              >
                <p style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  color: 'var(--color-primary-action)'
                }}>
                  You will generate <strong>{selectedTypes.length * itemsPerType} content items</strong> from {selectedTypes.length} selected type{selectedTypes.length > 1 ? 's' : ''}.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 border rounded-lg"
                style={{ 
                  backgroundColor: '#fee2e2',
                  borderColor: '#f87171',
                  color: '#b91c1c'
                }}
              >
                <p style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  margin: 0
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                fontFamily: 'var(--font-figtree), Figtree',
                backgroundColor: 'var(--color-primary-action)'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = 'var(--color-primary-action-hover)')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = 'var(--color-primary-action)')}
            >
              {isSubmitting ? 'Processing...' : 'Generate Content'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
