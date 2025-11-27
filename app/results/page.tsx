'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PortfolioNavbar } from '@/components/PortfolioNavbar'
import { Footer } from '@/components/Footer'
import { Copy, Download, DownloadIcon, ChevronDown, ChevronUp, RefreshCw, Send, X, ExternalLink, Maximize2, Check, Clipboard, FileDown, AlertCircle } from 'lucide-react'
import type { N8NResponse } from '@/lib/types'
import JSZip from 'jszip'

interface ResultItem {
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
  generation_status?: string
  generation_time?: string
  image_generated: boolean
  image_error: string | null
  processed_at: string
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState<string | null>(null)
  const [data, setData] = useState<N8NResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [transcriptExpanded, setTranscriptExpanded] = useState(false)
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [regenerateOpen, setRegenerateOpen] = useState<string | null>(null)
  const [regenerateInput, setRegenerateInput] = useState<string>('')
  const [regenerateLoading, setRegenerateLoading] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ResultItem | null>(null)
  const [showImagePrompt, setShowImagePrompt] = useState(false)
  const [uploadToast, setUploadToast] = useState<{message: string, type: 'success' | 'info' | 'warning'} | null>(null)
  const [downloadingZip, setDownloadingZip] = useState(false)

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
      /(?:youtu\.be\/)([\w-]{11})/,
      /(?:youtube\.com\/embed\/)([\w-]{11})/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  useEffect(() => {
    try {
      // First try to get data from sessionStorage (new method)
      const storedData = sessionStorage.getItem('vyx_content_result')
      if (storedData) {
        const parsedData = JSON.parse(storedData) as N8NResponse
        setData(parsedData)
        // Clear from sessionStorage after reading
        sessionStorage.removeItem('vyx_content_result')
      } else {
        // Fallback: try URL params (old method for backward compatibility)
        const encodedData = searchParams.get('data')
        if (encodedData) {
          const decodedData = JSON.parse(decodeURIComponent(encodedData)) as N8NResponse
          setData(decodedData)
        } else {
          setError('No data found. Please generate content first.')
        }
      }
    } catch (err) {
      setError('Failed to load results. Please try again.')
      console.error('Error parsing results:', err)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Reset modal states when modal closes or card changes
  useEffect(() => {
    if (!selectedCard) {
      setShowImagePrompt(false)
      setRegenerateOpen(null)
      setRegenerateInput('')
    } else {
      // Reset regenerate state when switching to a different card
      setRegenerateOpen(null)
      setRegenerateInput('')
    }
  }, [selectedCard])

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCard) {
        setSelectedCard(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedCard])

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

  const handleDownloadPackage = async () => {
    if (!data) return
    
    setDownloadingZip(true)
    
    try {
      const zip = new JSZip()
      
      // Loop through each content item
      for (const item of data.content.items) {
        // Skip items with empty content
        if (!item.content || item.content.trim() === '') continue
        
        // Create folder for this content type
        const folderName = item.content_type
        const folder = zip.folder(folderName)
        
        if (!folder) continue
        
        // Add text content file
        const textFileName = `${item.content_type}.txt`
        folder.file(textFileName, item.content)
        
        // Download and add image if available
        if (item.image_url) {
          try {
            const imageResponse = await fetch(item.image_url)
            const imageBlob = await imageResponse.blob()
            
            // Determine file extension from blob type or URL
            let extension = 'jpg'
            if (imageBlob.type.includes('png')) {
              extension = 'png'
            } else if (imageBlob.type.includes('jpeg') || imageBlob.type.includes('jpg')) {
              extension = 'jpg'
            } else if (imageBlob.type.includes('webp')) {
              extension = 'webp'
            }
            
            const imageFileName = `${item.content_type}.${extension}`
            folder.file(imageFileName, imageBlob)
          } catch (imageError) {
            console.warn(`Failed to download image for ${item.content_type}:`, imageError)
            // Continue even if image download fails
          }
        }
      }
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Trigger download
      const url = window.URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `content-package-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Show success message
      setUploadToast({ 
        message: `Package downloaded successfully with ${data.content.items.length} items!`, 
        type: 'success' 
      })
      setTimeout(() => setUploadToast(null), 4000)
      
    } catch (err) {
      console.error('Download error:', err)
      setUploadToast({ 
        message: 'Failed to create ZIP package. Please try again.', 
        type: 'warning' 
      })
      setTimeout(() => setUploadToast(null), 4000)
    } finally {
      setDownloadingZip(false)
    }
  }

  const handleRegenerateToggle = (itemId: string) => {
    if (regenerateOpen === itemId) {
      setRegenerateOpen(null)
      setRegenerateInput('')
    } else {
      setRegenerateOpen(itemId)
      setRegenerateInput('')
    }
  }

  const handleRegenerateSubmit = async (itemId: string) => {
    if (!regenerateInput.trim()) return
    
    setRegenerateLoading(itemId)
    
    // Simulate API call with 2-3 second delay
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Show success toast
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
    
    // Reset state
    setRegenerateLoading(null)
    setRegenerateOpen(null)
    setRegenerateInput('')
  }

  const getPlatformName = (contentType: string): string => {
    const platformMap: Record<string, string> = {
      'x_post': 'X',
      'blog': 'Blog',
      'instagram_post': 'Instagram',
      'instagram_reel_script': 'Instagram',
      'linkedin_post': 'LinkedIn',
      'facebook_post': 'Facebook',
      'youtube_shorts_script': 'YouTube'
    }
    return platformMap[contentType] || contentType
  }

  const handleDownloadBlog = (content: string, contentType: string) => {
    const markdown = `# ${contentType.replace(/_/g, ' ').toUpperCase()}\n\n${content}\n\n---\n\n*Generated by Content Generator*\n`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contentType}-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const copyImageToClipboard = async (imageUrl: string): Promise<boolean> => {
    // Try to copy image to clipboard (modern browsers only)
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ])
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to copy image:', err)
      return false
    }
  }

  const handleUploadToPlatform = async (item: ResultItem) => {
    /**
     * Platform Upload Strategy:
     * - X/Twitter: Uses intent URL (pre-fills content) ✅ No API needed
     * - LinkedIn: Copy to clipboard + open platform ℹ️ No URL scheme
     * - Facebook: Copy to clipboard + open platform ℹ️ Limited support
     * - Instagram: Copy text & image + suggest mobile app 📱 Web posting limited
     * - YouTube: Copy script + open Studio 🎥 Manual upload
     * - Blog: Download as Markdown file 📄 Export ready
     * 
     * Also opens source video URL in new tab for reference
     */
    const platform = getPlatformName(item.content_type)
    let toastMessage = ''
    let url = ''
    let shouldCopyToClipboard = true
    let shouldCopyImage = false
    let shouldOpenSourceUrl = true
    
    switch (item.content_type) {
      case 'x_post':
        // Twitter/X: Pre-fill tweet using intent URL (works without API!)
        const tweetText = encodeURIComponent(item.content.slice(0, 280))
        url = `https://twitter.com/intent/tweet?text=${tweetText}`
        toastMessage = 'Copied to clipboard — opened source in new tab'
        shouldCopyToClipboard = true
        break
      
      case 'linkedin_post':
        // LinkedIn: No URL scheme support, copy to clipboard
        url = 'https://www.linkedin.com/feed/'
        toastMessage = 'Copied to clipboard — opened source in new tab'
        break
      
      case 'facebook_post':
        // Facebook: Limited support, copy to clipboard
        url = 'https://www.facebook.com/'
        toastMessage = 'Copied to clipboard — opened source in new tab'
        break
      
      case 'instagram_post':
      case 'instagram_reel_script':
        // Instagram: Web posting limited, suggest mobile
        url = 'https://www.instagram.com/'
        shouldCopyImage = !!item.image_url
        toastMessage = 'Copied to clipboard — opened source in new tab'
        break
      
      case 'youtube_shorts_script':
        // YouTube: Open Studio, copy script
        url = 'https://studio.youtube.com/'
        toastMessage = 'Copied to clipboard — opened source in new tab'
        break
      
      case 'blog':
        // Blog: Download as markdown file
        handleDownloadBlog(item.content, item.content_type)
        toastMessage = 'Blog downloaded — opened source in new tab'
        shouldCopyToClipboard = false
        shouldOpenSourceUrl = true
        url = '' // Will open source URL separately
        break
      
      default:
        toastMessage = 'Content copied to clipboard!'
        break
    }
    
    // Copy content to clipboard (unless it's X or Blog)
    if (shouldCopyToClipboard) {
      try {
        await navigator.clipboard.writeText(item.content)
        
        // Try to copy image if needed (Instagram/Facebook)
        if (shouldCopyImage && item.image_url) {
          const imageCopied = await copyImageToClipboard(item.image_url)
          if (!imageCopied) {
            // If image copy failed, update toast message
            toastMessage = toastMessage.replace('Content & image copied', 'Content copied (image: right-click to copy)')
          }
        }
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        toastMessage = '⚠️ Copy failed. Please use the Copy button below.'
        setUploadToast({ message: toastMessage, type: 'warning' })
        setTimeout(() => setUploadToast(null), 5000)
        return // Don't open URL if copy failed
      }
    }
    
    // Show toast notification with appropriate type
    const toastType = item.content_type === 'blog' ? 'success' : 
                      toastMessage.includes('failed') || toastMessage.includes('⚠️') ? 'warning' :
                      'success'
    setUploadToast({ message: toastMessage, type: toastType })
    setTimeout(() => setUploadToast(null), 4000)
    
    // Open platform URL if specified
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    
    // Open source video URL in new tab (for reference)
    if (shouldOpenSourceUrl && data?.video?.url) {
      window.open(data.video.url, '_blank', 'noopener,noreferrer')
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

  const videoId = data.video.url ? getYouTubeVideoId(data.video.url) : null

  return (
    <>
      <PortfolioNavbar />
      
      {/* Success Toast */}
      {showSuccessToast && (
        <div
          className="fixed top-24 right-4 md:right-8 left-4 md:left-auto z-50 px-6 py-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-5"
          style={{
            backgroundColor: '#dbeafe',
            border: '2px solid #3b82f6',
            color: '#1e40af',
            maxWidth: '420px'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#3b82f6' }}>
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <p style={{ fontFamily: 'var(--font-figtree), Figtree', fontWeight: 600, fontSize: '0.95rem' }}>
              Regeneration request received!
            </p>
          </div>
        </div>
      )}

      {/* Upload Toast */}
      {uploadToast && (
        <div
          className="fixed top-24 right-4 md:right-8 left-4 md:left-auto z-50 px-6 py-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-5"
          style={{
            backgroundColor: uploadToast.type === 'success' ? '#dcfce7' : uploadToast.type === 'warning' ? '#fef3c7' : '#dbeafe',
            border: `2px solid ${uploadToast.type === 'success' ? '#22c55e' : uploadToast.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
            color: uploadToast.type === 'success' ? '#166534' : uploadToast.type === 'warning' ? '#92400e' : '#1e40af',
            maxWidth: '480px'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {uploadToast.type === 'success' && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#22c55e' }}>
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              {uploadToast.type === 'info' && (
                <Clipboard className="w-6 h-6" style={{ color: '#3b82f6' }} />
              )}
              {uploadToast.type === 'warning' && (
                <AlertCircle className="w-6 h-6" style={{ color: '#f59e0b' }} />
              )}
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: 'var(--font-figtree), Figtree', fontWeight: 600, fontSize: '0.95rem', lineHeight: '1.4' }}>
                {uploadToast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Generate More Content Button - Top Left */}
          <div className="mb-8">
            <a
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              style={{ 
                fontFamily: 'var(--font-figtree), Figtree',
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-secondary-foreground)',
                minHeight: '36px',
                border: '1px solid var(--color-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
                e.currentTarget.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
                e.currentTarget.style.opacity = '1'
              }}
            >
              ← Generate More Content
            </a>
          </div>

          {/* Page Title */}
          <div className="mb-12">
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

          {/* Hero Video Section */}
          <div className="mb-16">
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6" style={{ borderColor: 'var(--color-border-lighter)' }}>
              {videoId ? (
                <div className="w-full bg-black">
                  <div style={{ paddingBottom: '56.25%', position: 'relative' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-96 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <p style={{ color: 'var(--color-text-muted)' }}>Video preview unavailable</p>
                </div>
              )}
            </div>

            {/* Video Metadata - Below video */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2
                  className="text-3xl font-bold mb-1"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {data.video.title}
                </h2>
                <p
                  className="text-sm"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  {data.video.channel} • Job ID: {data.metadata.opus_job_id}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left: Full Transcript with Copy Button */}
            <div className="border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'var(--color-border-lighter)' }}>
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-lighter)', backgroundColor: 'var(--color-bg-lighter)' }}>
                <h3
                  className="text-xl font-bold"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Transcript
                </h3>
                <button
                  onClick={() => handleCopy(data.transcript?.full_text || data.video.transcript || '', 'transcript')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                  style={{ 
                    backgroundColor: copied === 'transcript' ? '#dcfce7' : 'white',
                    color: copied === 'transcript' ? '#16a34a' : 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-lighter)'
                  }}
                  onMouseEnter={(e) => !copied && (e.currentTarget.style.borderColor = '#3b82f6')}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-lighter)'}
                >
                  {copied === 'transcript' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <p
                  className="leading-relaxed"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.7'
                  }}
                >
                  {data.transcript?.full_text || data.video.transcript || 'No transcript available.'}
                </p>
              </div>
            </div>

            {/* Right: Video Summary with Copy Button */}
            <div className="border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'var(--color-border-lighter)' }}>
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border-lighter)', backgroundColor: 'var(--color-bg-lighter)' }}>
                <h3
                  className="text-xl font-bold"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Summary
                </h3>
                <button
                  onClick={() => handleCopy(data.analysis?.summary || data.video.summary || '', 'summary')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                  style={{ 
                    backgroundColor: copied === 'summary' ? '#dcfce7' : 'white',
                    color: copied === 'summary' ? '#16a34a' : 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-lighter)'
                  }}
                  onMouseEnter={(e) => !copied && (e.currentTarget.style.borderColor = '#3b82f6')}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-lighter)'}
                >
                  {copied === 'summary' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <p
                  className="leading-relaxed"
                  style={{ 
                    fontFamily: 'var(--font-figtree), Figtree',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.7'
                  }}
                >
                  {data.analysis?.summary || data.video.summary || 'No summary available.'}
                </p>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3 flex-wrap mb-12">
            <button
              onClick={handleDownloadPackage}
              disabled={downloadingZip}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                fontFamily: 'var(--font-figtree), Figtree',
                backgroundColor: 'var(--color-primary-action)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.opacity = '0.9'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.opacity = '1'
                }
              }}
            >
              {downloadingZip ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Creating ZIP...
                </>
              ) : (
                <>
                  <DownloadIcon className="w-5 h-5" />
                  Download All Package
                </>
              )}
            </button>
          </div>

          {/* Content Cards Grid */}
          <div>
            <h2 
              className="text-3xl font-bold mb-6"
              style={{ 
                fontFamily: 'var(--font-figtree), Figtree',
                color: 'var(--color-text-primary)'
              }}
            >
              Generated Content
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((item: ResultItem) => (
                <div
                  key={item.id}
                  className="border rounded-xl overflow-hidden transition-all hover:shadow-xl cursor-pointer"
                  style={{ borderColor: 'var(--color-border-lighter)' }}
                  onClick={() => setSelectedCard(item)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video w-full flex items-center justify-center overflow-hidden"
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

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Title */}
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="text-xl font-bold capitalize"
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        {item.content_type.replace(/_/g, ' ')}
                      </h3>
                      <Maximize2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    </div>

                    {/* Content Snippet */}
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ 
                        fontFamily: 'var(--font-figtree), Figtree',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      {item.content.slice(0, 100)}{item.content.length > 100 ? '...' : ''}
                    </p>

                    {/* Scores */}
                    <div className="flex gap-2 mb-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          backgroundColor: 'var(--color-warning)',
                          color: 'var(--color-warning-text)'
                        }}>
                        Virality: {item.scores.virality}
                      </span>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          backgroundColor: 'var(--color-success-light)',
                          color: 'var(--color-success)'
                        }}>
                        Usefulness: {item.scores.usefulness}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Primary: Upload Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUploadToPlatform(item)
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-semibold"
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          backgroundColor: 'var(--color-primary-action)',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        aria-label={`Upload to ${getPlatformName(item.content_type)}`}
                      >
                        <Send className="w-4 h-4" />
                        Upload to {getPlatformName(item.content_type)}
                      </button>

                      {/* Secondary: Regenerate Response Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCard(item)
                          setTimeout(() => handleRegenerateToggle(item.id), 100)
                        }}
                        disabled={regenerateLoading === item.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium disabled:opacity-50"
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          backgroundColor: 'var(--color-bg-lighter)',
                          color: 'var(--color-text-primary)',
                          border: '1.5px solid var(--color-border-lighter)'
                        }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.borderColor = '#3b82f6'
                            e.currentTarget.style.backgroundColor = '#eff6ff'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.borderColor = 'var(--color-border-lighter)'
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-lighter)'
                          }
                        }}
                        aria-label="Regenerate response"
                      >
                        {regenerateLoading === item.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Regenerate Response
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal */}
          {selectedCard && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black bg-opacity-50 animate-in fade-in duration-200"
              onClick={() => setSelectedCard(null)}
            >
              <div
                className="bg-white md:rounded-2xl max-w-4xl w-full h-full md:h-auto md:max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button Header */}
                <div className="flex-shrink-0 flex justify-end p-4 border-b" style={{ borderColor: 'var(--color-border-lighter)' }}>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-lighter)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  {/* Full Image */}
                  {selectedCard.image_url && (
                    <div className="mb-6 rounded-xl overflow-hidden">
                      <img
                        src={selectedCard.image_url || "/placeholder.svg"}
                        alt={selectedCard.content_type}
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Title and Scores */}
                  <div className="mb-6">
                    <h2
                      className="text-3xl font-bold capitalize mb-4"
                      style={{ 
                        fontFamily: 'var(--font-figtree), Figtree',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {selectedCard.content_type.replace(/_/g, ' ')}
                    </h2>

                    {/* Overall Score - Prominent Display */}
                    {selectedCard.scores.overall !== undefined && (
                      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-lighter)', border: '2px solid var(--color-border-lighter)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-figtree), Figtree', color: 'var(--color-text-primary)' }}>
                            Overall Score
                          </span>
                          <span className="text-3xl font-bold" style={{ 
                            fontFamily: 'var(--font-figtree), Figtree',
                            color: selectedCard.scores.overall >= 86 ? '#16a34a' : 
                                   selectedCard.scores.overall >= 71 ? '#0988F0' :
                                   selectedCard.scores.overall >= 51 ? '#eab308' :
                                   selectedCard.scores.overall >= 31 ? '#f97316' : '#dc2626'
                          }}>
                            {selectedCard.scores.overall}/100
                          </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${selectedCard.scores.overall}%`,
                              backgroundColor: selectedCard.scores.overall >= 86 ? '#16a34a' : 
                                             selectedCard.scores.overall >= 71 ? '#0988F0' :
                                             selectedCard.scores.overall >= 51 ? '#eab308' :
                                             selectedCard.scores.overall >= 31 ? '#f97316' : '#dc2626'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Detailed Scores Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Virality */}
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#92400e' }}>
                            🔥 Virality
                          </span>
                          <span className="text-lg font-bold" style={{ color: '#92400e' }}>
                            {selectedCard.scores.virality}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#fde68a' }}>
                          <div className="h-full rounded-full" style={{ width: `${selectedCard.scores.virality}%`, backgroundColor: '#f59e0b' }} />
                        </div>
                      </div>

                      {/* Usefulness */}
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#dcfce7', border: '1px solid #22c55e' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#166534' }}>
                            💡 Usefulness
                          </span>
                          <span className="text-lg font-bold" style={{ color: '#166534' }}>
                            {selectedCard.scores.usefulness}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#bbf7d0' }}>
                          <div className="h-full rounded-full" style={{ width: `${selectedCard.scores.usefulness}%`, backgroundColor: '#22c55e' }} />
                        </div>
                      </div>

                      {/* Engagement */}
                      {selectedCard.scores.engagement !== undefined && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#1e40af' }}>
                              💬 Engagement
                            </span>
                            <span className="text-lg font-bold" style={{ color: '#1e40af' }}>
                              {selectedCard.scores.engagement}
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#bfdbfe' }}>
                            <div className="h-full rounded-full" style={{ width: `${selectedCard.scores.engagement}%`, backgroundColor: '#3b82f6' }} />
                          </div>
                        </div>
                      )}

                      {/* Quality */}
                      {selectedCard.scores.quality !== undefined && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#fae8ff', border: '1px solid #a855f7' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#6b21a8' }}>
                              ⭐ Quality
                            </span>
                            <span className="text-lg font-bold" style={{ color: '#6b21a8' }}>
                              {selectedCard.scores.quality}
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e9d5ff' }}>
                            <div className="h-full rounded-full" style={{ width: `${selectedCard.scores.quality}%`, backgroundColor: '#a855f7' }} />
                          </div>
                        </div>
                      )}

                      {/* SEO Discoverability */}
                      {selectedCard.scores.seo_discoverability !== undefined && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#fed7aa', border: '1px solid #f97316' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#7c2d12' }}>
                              🔍 SEO
                            </span>
                            <span className="text-lg font-bold" style={{ color: '#7c2d12' }}>
                              {selectedCard.scores.seo_discoverability}
                            </span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#fed7aa' }}>
                            <div className="h-full rounded-full" style={{ width: `${selectedCard.scores.seo_discoverability}%`, backgroundColor: '#f97316' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata - Best Time to Post & Estimated Reach */}
                    {(selectedCard.best_time_to_post || selectedCard.estimated_reach) && (
                      <div className="flex gap-3 flex-wrap mb-6">
                        {selectedCard.best_time_to_post && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                            style={{ 
                              backgroundColor: '#e0f2fe',
                              color: '#075985',
                              border: '1px solid #0284c7'
                            }}>
                            🕒 Best Time: {selectedCard.best_time_to_post}
                          </div>
                        )}
                        {selectedCard.estimated_reach && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                            style={{ 
                              backgroundColor: '#f0fdf4',
                              color: '#166534',
                              border: '1px solid #22c55e'
                            }}>
                            📊 Estimated Reach: {selectedCard.estimated_reach}
                          </div>
                        )}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                          style={{ 
                            backgroundColor: 'var(--color-bg-lighter)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border-lighter)'
                          }}>
                          📐 Aspect Ratio: {selectedCard.aspect_ratio}
                        </div>
                      </div>
                    )}

                    {/* Score Reasoning */}
                    {selectedCard.score_reasoning && (
                      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #0284c7' }}>
                        <h4 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#075985' }}>
                          📝 Score Reasoning
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#0c4a6e' }}>
                          {selectedCard.score_reasoning}
                        </p>
                      </div>
                    )}

                    {/* Improvement Suggestions */}
                    {selectedCard.improvement_suggestions && selectedCard.improvement_suggestions.length > 0 && (
                      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fefce8', border: '1px solid #eab308' }}>
                        <h4 className="text-sm font-bold mb-3" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#854d0e' }}>
                          💡 Improvement Suggestions
                        </h4>
                        <ul className="space-y-2">
                          {selectedCard.improvement_suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ fontFamily: 'var(--font-figtree), Figtree', color: '#713f12' }}>
                              <span className="flex-shrink-0 mt-0.5">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Full Content */}
                  <div className="mb-6">
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ 
                        fontFamily: 'var(--font-figtree), Figtree',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      Content
                    </h3>
                    <p
                      className="leading-relaxed whitespace-pre-line"
                      style={{ 
                        fontFamily: 'var(--font-figtree), Figtree',
                        color: 'var(--color-text-secondary)',
                        fontSize: '1rem',
                        lineHeight: '1.7'
                      }}
                    >
                      {selectedCard.content}
                    </p>
                  </div>

                  {/* Image Prompt (Expandable) */}
                  {selectedCard.image_prompt && (
                    <div className="mb-6">
                      <button
                        onClick={() => setShowImagePrompt(!showImagePrompt)}
                        className="flex items-center justify-between w-full p-4 rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: 'var(--color-bg-lighter)',
                          border: '1px solid var(--color-border-lighter)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-lighter)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-lighter)'}
                      >
                        <span
                          className="font-semibold"
                          style={{ 
                            fontFamily: 'var(--font-figtree), Figtree',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          Image Prompt
                        </span>
                        {showImagePrompt ? (
                          <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                        ) : (
                          <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                        )}
                      </button>
                      {showImagePrompt && (
                        <div
                          className="mt-3 p-4 rounded-lg"
                          style={{ 
                            backgroundColor: 'var(--color-bg-lightest)',
                            border: '1px solid var(--color-border-lighter)'
                          }}
                        >
                          <p
                            style={{ 
                              fontFamily: 'var(--font-figtree), Figtree',
                              color: 'var(--color-text-secondary)',
                              fontSize: '0.9rem',
                              lineHeight: '1.6'
                            }}
                          >
                            {selectedCard.image_prompt}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Sticky Action Buttons Footer */}
                <div className="flex-shrink-0 border-t p-4 md:p-6 bg-white md:rounded-b-2xl" style={{ borderColor: 'var(--color-border-lighter)' }}>
                  {/* Primary Action Buttons */}
                  <div className="flex gap-3 flex-wrap mb-3">
                    <button
                      onClick={() => handleCopy(selectedCard.content, selectedCard.id)}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold"
                      style={{ 
                        fontFamily: 'var(--font-figtree), Figtree',
                        backgroundColor: copied === selectedCard.id ? '#dcfce7' : 'var(--color-bg-lightest)',
                        color: copied === selectedCard.id ? '#16a34a' : 'var(--color-text-primary)',
                        border: '1px solid var(--color-border-lighter)'
                      }}
                      aria-label="Copy content to clipboard"
                    >
                      <Copy className="w-5 h-5" aria-hidden="true" />
                      {copied === selectedCard.id ? 'Copied!' : 'Copy Content'}
                    </button>
                    {selectedCard.image_url && (
                      <button
                        onClick={() => handleDownloadImage(selectedCard.image_url, selectedCard.content_type)}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold"
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          backgroundColor: 'var(--color-bg-lightest)',
                          color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-border-lighter)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border-lighter)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-lightest)'}
                        aria-label="Download image"
                      >
                        <Download className="w-5 h-5" aria-hidden="true" />
                        Download Image
                      </button>
                    )}
                    <button
                      onClick={() => handleUploadToPlatform(selectedCard)}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold"
                      style={{ 
                        fontFamily: 'var(--font-figtree), Figtree',
                        backgroundColor: 'var(--color-primary-action)',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      aria-label={`Upload to ${getPlatformName(selectedCard.content_type)} and open source`}
                    >
                      <Send className="w-5 h-5" aria-hidden="true" />
                      Upload to {getPlatformName(selectedCard.content_type)}
                    </button>
                  </div>

                  {/* Regenerate Response Button (Secondary Priority) */}
                  <div className="mb-4">
                    <button
                      onClick={() => handleRegenerateToggle(selectedCard.id)}
                      disabled={regenerateLoading === selectedCard.id}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        fontFamily: 'var(--font-figtree), Figtree',
                        backgroundColor: regenerateOpen === selectedCard.id ? '#3b82f6' : 'var(--color-bg-lighter)',
                        color: regenerateOpen === selectedCard.id ? 'white' : 'var(--color-text-primary)',
                        border: `2px solid ${regenerateOpen === selectedCard.id ? '#3b82f6' : 'var(--color-border-lighter)'}`
                      }}
                      onMouseEnter={(e) => {
                        if (regenerateOpen !== selectedCard.id && !e.currentTarget.disabled) {
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.backgroundColor = '#eff6ff'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (regenerateOpen !== selectedCard.id) {
                          e.currentTarget.style.borderColor = 'var(--color-border-lighter)'
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-lighter)'
                        }
                      }}
                      aria-label="Regenerate response with feedback"
                    >
                      {regenerateLoading === selectedCard.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" aria-hidden="true" />
                      ) : (
                        <RefreshCw className="w-5 h-5" aria-hidden="true" />
                      )}
                      Regenerate Response
                    </button>
                  </div>

                  {/* Regenerate Input Section */}
                  {regenerateOpen === selectedCard.id && (
                    <div 
                      className="p-6 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
                      style={{ 
                        backgroundColor: '#f0f9ff',
                        border: '2px solid #3b82f6'
                      }}
                    >
                      <label
                        htmlFor={`regenerate-input-modal-${selectedCard.id}`}
                        className="block text-sm font-semibold mb-3"
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        Provide feedback or modifications:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          id={`regenerate-input-modal-${selectedCard.id}`}
                          type="text"
                          placeholder="e.g., Make it more casual, add emoji, shorter version..."
                          value={regenerateInput}
                          onChange={(e) => setRegenerateInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && regenerateInput.trim()) {
                              handleRegenerateSubmit(selectedCard.id)
                            }
                          }}
                          disabled={regenerateLoading === selectedCard.id}
                          className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none bg-white disabled:opacity-50 transition-all"
                          style={{ 
                            fontFamily: 'var(--font-figtree), Figtree',
                            borderColor: '#3b82f6',
                            color: 'var(--color-text-primary)',
                            minHeight: '48px'
                          }}
                          onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'}
                          onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                        />
                        <button
                          onClick={() => handleRegenerateSubmit(selectedCard.id)}
                          disabled={!regenerateInput.trim() || regenerateLoading === selectedCard.id}
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          style={{ 
                            fontFamily: 'var(--font-figtree), Figtree',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            minHeight: '48px',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = '#2563eb'
                            }
                          }}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          {regenerateLoading === selectedCard.id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Send
                            </>
                          )}
                        </button>
                      </div>
                      <p
                        className="text-xs mt-3"
                        style={{ 
                          fontFamily: 'var(--font-figtree), Figtree',
                          color: '#6b7280'
                        }}
                      >
                        💡 Tip: Be specific about what you want to change for better results
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
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
    }>
      <ResultsContent />
    </Suspense>
  )
}
