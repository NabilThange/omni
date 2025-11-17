"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from 'lucide-react'
type FAQItem = {
  question: string
  answer: string
}
type FAQSectionProps = {
  title?: string
  faqs?: FAQItem[]
}
const defaultFAQs: FAQItem[] = [
  {
    question: "What is Omni and how does it work?",
    answer:
      "Omni is an AI-powered content repurposing engine that transforms long-form videos into multiple platform-optimized micro-content pieces. It analyzes your source material and generates ready-to-post content for blog posts, social media, short-form video, and image assets. Simply upload your video, select your desired content types, and get instant quality scores, downloadable packages, and audit logs for complete transparency.",
  },
  {
    question: "How does Omni generate content with virality and usefulness scores?",
    answer:
      "Omni uses advanced natural language processing and machine learning models to analyze each generated content piece and predict its performance potential. The virality score estimates engagement likelihood based on trending patterns and audience preferences, while the usefulness score measures how well content aligns with your target audience needs. Both scores are powered by analysis of millions of successful content pieces across platforms, helping you prioritize which pieces to promote.",
  },
  {
    question: "How do I get started with Omni and what are the pricing options?",
    answer:
      "Getting started is simple: sign up for a free trial, upload your first video, select your desired content formats, and receive your generated package within minutes. We offer flexible pricing tiers: Starter (free for trials), Professional ($99/month for individuals), and Enterprise (custom pricing with dedicated support and batch processing). All plans include API access, audit logs, and quality scoring. Contact our sales team for volume discounts and custom enterprise solutions.",
  },
]
export const FAQSection = ({ title = "Frequently asked questions", faqs = defaultFAQs }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }
  return (
    <section id="resources" className="w-full py-24 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Column - Title */}
          <div className="lg:col-span-4">
            <h2
              className="text-[40px] leading-tight font-normal tracking-tight sticky top-24"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
                fontWeight: "400",
                fontSize: "40px",
                color: 'var(--color-text-primary)'
              }}
            >
              {title}
            </h2>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b last:border-b-0" style={{ borderColor: 'var(--color-border-light)' }}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between py-6 text-left group hover:opacity-70 transition-opacity duration-150"
                    aria-expanded={openIndex === index}
                  >
                    <span
                      className="text-lg leading-7 pr-8"
                      style={{
                        fontFamily: "var(--font-figtree), Figtree",
                        fontWeight: "400",
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{
                        rotate: openIndex === index ? 45 : 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="flex-shrink-0"
                    >
                      <Plus className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} strokeWidth={1.5} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pr-12">
                          <p
                            className="text-lg leading-6"
                            style={{
                              fontFamily: "var(--font-figtree), Figtree",
                              color: 'var(--color-text-tertiary)'
                            }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
