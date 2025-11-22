'use client'

import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

const Loader1 = dynamic(() => import('./loaders/LoaderAnimation1'), { ssr: false })
const Loader2 = dynamic(() => import('./loaders/LoaderAnimation2'), { ssr: false })
const Loader3 = dynamic(() => import('./loaders/LoaderAnimation3'), { ssr: false })
const Loader4 = dynamic(() => import('./loaders/LoaderAnimation4'), { ssr: false })
const Loader5 = dynamic(() => import('./loaders/LoaderAnimation5'), { ssr: false })
const Loader6 = dynamic(() => import('./loaders/LoaderAnimation6'), { ssr: false })
const Loader7 = dynamic(() => import('./loaders/LoaderAnimation7'), { ssr: false })
const Loader8 = dynamic(() => import('./loaders/LoaderAnimation8'), { ssr: false })
const Loader9 = dynamic(() => import('./loaders/LoaderAnimation9'), { ssr: false })
const Loader10 = dynamic(() => import('./loaders/LoaderAnimation10'), { ssr: false })
const Loader11 = dynamic(() => import('./loaders/LoaderAnimation11'), { ssr: false })

export const MESSAGES = [
  "Vyx is studying your video's strongest moments…",
  "Extracting key ideas and transforming them into platform-ready pieces…",
  "Crafting posts, captions, and scripts with precision…",
  "Generating high-impact content tailored to each platform…",
  "Scoring and refining each piece for maximum impact…",
  "Your Vyx-powered content is almost ready…"
];



interface ProcessingModalProps {
  open: boolean
  onCancel?: () => void
  estimatedTime?: string
}

export function ProcessingModal({
  open,
  onCancel,
  estimatedTime = '60–90 sec',
}: ProcessingModalProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Generate random loader sequence once per modal open
  const loaderSequence = useMemo(() => {
    const sequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // Fisher-Yates shuffle
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[sequence[i], sequence[j]] = [sequence[j], sequence[i]]
    }
    return sequence
  }, [open])

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
    }, 15000) // 15 seconds per message (90 seconds / 6 messages)
    return () => clearInterval(interval)
  }, [open])

  const getActiveAnimation = () => {
    const cycleTime = 90 // Total cycle: 11 loaders over 90 seconds
    const normalizedTime = elapsedSeconds % cycleTime

    // Each loader shows for ~8.2 seconds (90/11)
    // Return loader from random sequence
    const index = Math.floor(normalizedTime / 8.2)
    return loaderSequence[Math.min(index, 10)]
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
          {/* Loader Animation - Cycling between 11 animations with smooth transitions */}
          <div className="mb-10 flex items-center justify-center h-40 relative">
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 1 ? 1 : 0 }}
            >
              <Loader1 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 2 ? 1 : 0 }}
            >
              <Loader2 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 3 ? 1 : 0 }}
            >
              <Loader3 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 4 ? 1 : 0 }}
            >
              <Loader4 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 5 ? 1 : 0 }}
            >
              <Loader5 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 6 ? 1 : 0 }}
            >
              <Loader6 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 7 ? 1 : 0 }}
            >
              <Loader7 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 8 ? 1 : 0 }}
            >
              <Loader8 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 9 ? 1 : 0 }}
            >
              <Loader9 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 10 ? 1 : 0 }}
            >
              <Loader10 />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
              style={{ opacity: activeAnimation === 11 ? 1 : 0 }}
            >
              <Loader11 />
            </div>
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
          <div className="flex items-center gap-3 justify-center mb-6">
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

          {/* Progress Bar */}
          <div className="w-full max-w-md mb-12">
            <div 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-lighter)' }}
            >
              <div
                className="h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.min(100, (elapsedSeconds / 90) * 100)}%`,
                  backgroundColor: 'var(--color-primary-action)',
                }}
              />
            </div>
            <p
              className="text-xs text-center mt-2"
              style={{
                fontFamily: 'var(--font-figtree), Figtree',
                color: 'var(--color-text-muted)',
              }}
            >
              {elapsedSeconds >= 90 ? (
                <span className="font-semibold" style={{ color: 'var(--color-primary-action)' }}>
                  Preparing your content… hang tight, amazing things are on the way!
                </span>
              ) : (
                `${Math.min(100, Math.floor((elapsedSeconds / 90) * 100))}% complete`
              )}
            </p>
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
