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

// Clips-specific processing messages with step indicators
export const CLIPS_STEPS = [
  { id: 'download', label: 'Downloading video…', description: 'Fetching video content from YouTube' },
  { id: 'transcript', label: 'Analyzing transcript…', description: 'Extracting and processing speech content' },
  { id: 'highlights', label: 'Selecting highlights…', description: 'AI is identifying the most engaging moments' },
  { id: 'render', label: 'Rendering clips…', description: 'Creating optimized video clips with subtitles' },
  { id: 'upload', label: 'Uploading clips…', description: 'Finalizing and preparing download links' },
]

interface ClipsProcessingModalProps {
  open: boolean
  onCancel?: () => void
}

export function ClipsProcessingModal({
  open,
  onCancel,
}: ClipsProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Generate random loader sequence once per modal open
  const loaderSequence = useMemo(() => {
    const sequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
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
      setCurrentStep(0)
      return
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [open])

  // Progress through steps based on elapsed time
  // Typical processing: 2-5 minutes, so we spread steps across ~4 minutes
  useEffect(() => {
    if (!open) return
    
    // Step progression timing (in seconds):
    // 0-30s: Downloading, 30-60s: Analyzing, 60-120s: Selecting, 120-180s: Rendering, 180+: Uploading
    const stepTimes = [0, 30, 60, 120, 180]
    
    for (let i = stepTimes.length - 1; i >= 0; i--) {
      if (elapsedSeconds >= stepTimes[i]) {
        setCurrentStep(i)
        break
      }
    }
  }, [elapsedSeconds, open])

  const getActiveAnimation = () => {
    const cycleTime = 300 // 5 minute cycle
    const normalizedTime = elapsedSeconds % cycleTime
    const index = Math.floor(normalizedTime / 27.3) // ~27s per loader
    return loaderSequence[Math.min(index, 10)]
  }

  const activeAnimation = getActiveAnimation()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clips-processing-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-2xl rounded-3xl shadow-2xl p-8 md:p-12 transform transition-all duration-300 animate-in fade-in scale-95"
        style={{
          backgroundColor: 'var(--color-bg-page)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Loader Animation */}
          <div className="mb-8 flex items-center justify-center h-32 relative">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
              <div
                key={num}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
                style={{ opacity: activeAnimation === num ? 1 : 0 }}
              >
                {num === 1 && <Loader1 />}
                {num === 2 && <Loader2 />}
                {num === 3 && <Loader3 />}
                {num === 4 && <Loader4 />}
                {num === 5 && <Loader5 />}
                {num === 6 && <Loader6 />}
                {num === 7 && <Loader7 />}
                {num === 8 && <Loader8 />}
                {num === 9 && <Loader9 />}
                {num === 10 && <Loader10 />}
                {num === 11 && <Loader11 />}
              </div>
            ))}
          </div>

          <h2 id="clips-processing-title" className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-figtree), Figtree',
              color: 'var(--color-text-primary)',
            }}
          >
            Generating Your Clips
          </h2>

          {/* Step Progress */}
          <div className="w-full max-w-md mb-8">
            <div className="space-y-3">
              {CLIPS_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 transition-all duration-300"
                  style={{
                    opacity: index <= currentStep ? 1 : 0.4,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: index < currentStep 
                        ? 'var(--color-success)' 
                        : index === currentStep 
                          ? 'var(--color-primary-action)' 
                          : 'var(--color-border-light)',
                    }}
                  >
                    {index < currentStep ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : index === currentStep ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-white/50 rounded-full" />
                    )}
                  </div>
                  <div className="text-left">
                    <p
                      className="text-sm font-medium"
                      style={{
                        fontFamily: 'var(--font-figtree), Figtree',
                        color: index === currentStep ? 'var(--color-primary-action)' : 'var(--color-text-primary)',
                      }}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timer and Warning */}
          <div className="mb-8 text-center">
            <p
              className="text-2xl font-mono font-semibold mb-2"
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                color: 'var(--color-primary-action)',
              }}
            >
              {formatTime(elapsedSeconds)}
            </p>
            <p
              className="text-sm"
              style={{
                fontFamily: 'var(--font-figtree), Figtree',
                color: 'var(--color-text-muted)',
              }}
            >
              This typically takes 2–5 minutes. Please don't refresh.
            </p>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-figtree), Figtree',
                backgroundColor: 'var(--color-bg-lighter)',
                color: 'var(--color-text-primary)',
                border: '1.5px solid var(--color-border-light)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-lightest)'
                e.currentTarget.style.borderColor = 'var(--color-primary-action)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-lighter)'
                e.currentTarget.style.borderColor = 'var(--color-border-light)'
              }}
              aria-label="Cancel clip generation"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
