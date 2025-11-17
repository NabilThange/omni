'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PortfolioNavbar } from '@/components/PortfolioNavbar'
import { Footer } from '@/components/Footer'
import { Copy, Download, DownloadIcon } from 'lucide-react'
import type { N8NResponse } from '@/lib/n8n-client'

interface ResultItem {
  id: string
  content_type: string
  content: string
  image_url?: string
  image_base64?: string
  scores: {
    virality: number
    usefulness: number
  }
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState<string | null>(null)
  const [data, setData] = useState<N8NResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const encodedData = searchParams.get('data')
      if (encodedData) {
        const decodedData = JSON.parse(decodeURIComponent(encodedData)) as N8NResponse
        setData(decodedData)
      } else {
        setError('No data found. Please generate content first.')
      }
    } catch (err) {
      setError('Failed to load results. Please try again.')
      console.error('Error parsing results:', err)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const handleCopy = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text)
    setCopied(itemId)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownloadImage = async (imageUrl: string | undefined, contentType: string) => {
    if (!imageUrl) {
      alert('No image available for download')
      return
    }
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${contentType}-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download image')
    }
  }

  const handleDownloadPackage = () => {
    if (!data) return
    try {
      const packageData = JSON.stringify(data, null, 2)
      const blob = new Blob([packageData], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `content-package-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download package')
    }
  }

  if (loading) {
    return (
      <>
        <PortfolioNavbar />
        <main className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--color-primary-action)' }} />
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>Loading results...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <PortfolioNavbar />
        <main className="min-h-screen bg-white pt-32 pb-16">
          <div className="max-w-6xl mx-auto px-8">
            <div className="p-6 border rounded-lg" style={{ backgroundColor: '#fee2e2', borderColor: '#f87171' }}>
              <p style={{ color: '#b91c1c', margin: 0 }}>{error || 'Error loading results'}</p>
            </div>
            <div className="mt-8 text-center">
              <a href="/upload" className="font-semibold" style={{ color: 'var(--color-primary-action)' }}>
                Go back and try again
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Filter out empty or null content items
  const results = data.content.items.filter((item: ResultItem) => {
    return item.content && item.content.trim() !== ''
  })

  // Show message if no valid content items
  if (results.length === 0) {
    return (
      <>
        <PortfolioNavbar />
        <main className="min-h-screen bg-white pt-32 pb-16">
          <div className="max-w-6xl mx-auto px-8">
            <div className="p-6 border rounded-lg" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
              <p style={{ color: '#92400e', margin: 0 }}>No content was generated from your video. Please try again with a different video.</p>
            </div>
            <div className="mt-8 text-center">
              <a href="/upload" className="font-semibold" style={{ color: 'var(--color-primary-action)' }}>
                Go back and try again
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <PortfolioNavbar />
      <main className="min-h-screen bg-white pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1
                  className="text-5xl font-bold mb-2"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Your Content Is Ready
                </h1>
                <p
                  className="text-lg"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  We generated {results.length} optimized content pieces from your video
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-light)' }}>
                  Job ID: {data.metadata.opus_job_id}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  {data.video.title}
                </p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleDownloadPackage}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                style={{ 
                  fontFamily: 'var(--font-figtree), Figtree',
                  backgroundColor: 'var(--color-primary-action)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <DownloadIcon className="w-5 h-5" />
                Download All Package
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-8">
            {results.map((item: ResultItem) => (
              <div
                key={item.id}
                className="border rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
                style={{ borderColor: 'var(--color-border-lighter)' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Image */}
                  <div className="md:col-span-1 aspect-square flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: 'var(--color-bg-lighter)' }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.content_type}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div style={{ color: 'var(--color-text-muted)' }}>No image</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="md:col-span-2 p-8 flex flex-col justify-between">
                    {/* Header with Type and Scores */}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3
                          className="text-2xl font-bold capitalize"
                          style={{ 
                            fontFamily: 'var(--font-figtree), Figtree',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {item.content_type.replace('_', ' ')}
                        </h3>
                        <div className="flex gap-4">
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                              style={{ 
                                backgroundColor: 'var(--color-warning)',
                                color: 'var(--color-warning-text)'
                              }}>
                              Virality: {item.scores.virality}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                              style={{ 
                                backgroundColor: 'var(--color-success-light)',
                                color: 'var(--color-success)'
                              }}>
                              Usefulness: {item.scores.usefulness}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Text */}
                      <p
                        className="leading-relaxed whitespace-pre-line mb-6 line-clamp-4"
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          color: 'var(--color-text-secondary)'
                        }}
                      >
                        {item.content}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleCopy(item.content, item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors`}
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          backgroundColor: copied === item.id ? '#dcfce7' : 'var(--color-bg-lightest)',
                          color: copied === item.id ? '#16a34a' : 'var(--color-text-primary)'
                        }}
                      >
                        <Copy className="w-4 h-4" />
                        {copied === item.id ? 'Copied!' : 'Copy'}
                      </button>
                      {item.image_url && (
                        <button
                          onClick={() => handleDownloadImage(item.image_url, item.content_type)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold"
                          style={{ 
                            fontFamily: 'var(--font-figtree), Figtree',
                            backgroundColor: 'var(--color-bg-lightest)',
                            color: 'var(--color-text-primary)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-lighter)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-lightest)'}
                        >
                          <Download className="w-4 h-4" />
                          Download Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back to Upload */}
          <div className="mt-12 text-center">
            <a
              href="/upload"
              className="inline-block font-semibold hover:underline"
              style={{ 
                fontFamily: 'var(--font-figtree), Figtree',
                color: 'var(--color-primary-action)'
              }}
            >
              Generate more content from another video
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
