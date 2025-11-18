'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

const Loader1 = dynamic(() => import('./loaders/LoaderAnimation1'), { ssr: false })
const Loader2 = dynamic(() => import('./loaders/LoaderAnimation2'), { ssr: false })
const Loader3 = dynamic(() => import('./loaders/LoaderAnimation3'), { ssr: false })
const Loader4 = dynamic(() => import('./loaders/LoaderAnimation4'), { ssr: false })
const Loader5 = dynamic(() => import('./loaders/LoaderAnimation5'), { ssr: false })
const Loader6 = dynamic(() => import('./loaders/LoaderAnimation6'), { ssr: false })

const MESSAGES = [
  'Hang tight — we\'re fetching the good bits.',
  'Cooking up the post you wished for…',
  'Extracting highlights and smart snippets.',
  'Formatting copy for high engagement.',
  'Generating image prompts and thumbnails.',
  'Polishing SEO & AEO magic.',
  'Almost there — final touches.',
]

interface ProcessingModalProps {
  open: boolean
  onCancel?: () => void
  estimatedTime?: string
}

export function ProcessingModal({
  open,
  onCancel,
  estimatedTime = '2–5 min',
}: ProcessingModalProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setElapsedSeconds(0)
      return
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    setMessageIndex(0)
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [open])

  const getActiveAnimation = () => {
    const cycleTime = 420 // Total cycle matches 7 minute timeout: 6 loaders × 70s each
    const normalizedTime = elapsedSeconds % cycleTime

    if (normalizedTime < 70) return 1
    if (normalizedTime < 140) return 2
    if (normalizedTime < 210) return 3
    if (normalizedTime < 280) return 4
    if (normalizedTime < 350) return 5
    return 6
  }

  const activeAnimation = getActiveAnimation()

  if (!mounted || !open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="processing-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-2xl rounded-3xl shadow-2xl p-12 transform transition-all duration-300 animate-in fade-in scale-95"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Main Content Container - Centered Layout */}
        <div className="flex flex-col items-center text-center">
          {/* Loader Animation - Cycling between 6 animations */}
          <div className="mb-10 flex items-center justify-center h-40">
            {activeAnimation === 1 && <Loader1 />}
            {activeAnimation === 2 && <Loader2 />}
            {activeAnimation === 3 && <Loader3 />}
            {activeAnimation === 4 && <Loader4 />}
            {activeAnimation === 5 && <Loader5 />}
            {activeAnimation === 6 && <Loader6 />}
          </div>

          <h2 id="processing-title" className="text-4xl font-bold mb-6"
            style={{
              fontFamily: 'var(--font-figtree), Figtree',
              color: 'var(--color-text-primary)',
            }}
          >
            Processing your content…
          </h2>

          {/* Dynamic Message */}
          <p
            className="text-lg min-h-24 transition-opacity duration-500 mb-10"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontFamily: 'var(--font-figtree), Figtree',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
            }}
          >
            {MESSAGES[messageIndex]}
          </p>

          {/* Progress Dots - More Spacious */}
          <div className="flex items-center gap-3 justify-center mb-12">
            {MESSAGES.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === messageIndex ? '12px' : '8px',
                  height: '8px',
                  backgroundColor: i === messageIndex ? 'var(--color-primary-action)' : 'var(--color-border-light)',
                  transform: i === messageIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Bottom Info Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t"
            style={{
              borderColor: 'var(--color-border-light)',
            }}
          >
            <p className="text-sm"
              style={{
                fontFamily: 'var(--font-figtree), Figtree',
                color: 'var(--color-text-secondary)',
              }}
            >
              Usually done within <span className="font-semibold text-base">{estimatedTime}</span>
            </p>

            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{
                  fontFamily: 'var(--font-figtree), Figtree',
                  backgroundColor: 'var(--color-bg-lighter)',
                  color: 'var(--color-text-primary)',
                  border: `1.5px solid var(--color-border-light)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-lightest)'
                  e.currentTarget.style.borderColor = 'var(--color-primary-action)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-lighter)'
                  e.currentTarget.style.borderColor = 'var(--color-border-light)'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
