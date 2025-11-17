"use client"
import { motion } from "framer-motion"
import { ArrowUpRight } from 'lucide-react'
type ProductTeaserCardProps = {
  headline?: string
  subheadline?: string
  primaryButtonText?: string
  primaryButtonHref?: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
}

// @component: ProductTeaserCard
export const ProductTeaserCard = (props: ProductTeaserCardProps) => {
  const {
    headline = "One Video, Infinite Content Opportunities",
    subheadline = "Upload your long-form video and let AI transform it into blog posts, social media captions, short-form scripts, and images. Get instant virality and usefulness scores for each generated piece.",
    primaryButtonText = "Start Repurposing",
    primaryButtonHref = "/upload",
    secondaryButtonText = "View Examples",
    secondaryButtonHref = "#features",
  } = props

  // @return
  return (
    <section className="w-full px-4 sm:px-8 pt-16 sm:pt-24 lg:pt-32 pb-8 sm:pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-2">
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              ease: [0.645, 0.045, 0.355, 1],
            }}
            className="w-full lg:w-1/2 bg-[#e9e9e9] rounded-2xl sm:rounded-[40px] p-6 sm:p-8 lg:p-16 flex flex-col justify-end min-h-[400px] sm:min-h-[500px] lg:aspect-square overflow-hidden"
          >
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] leading-tight tracking-tight max-w-full lg:max-w-[520px] mb-4 sm:mb-6"
              style={{
                fontWeight: "500",
                fontFamily: "var(--font-figtree), Figtree",
                color: 'var(--color-text-primary)'
              }}
            >
              {headline}
            </h1>

            <p
              className="text-base sm:text-lg leading-6 sm:leading-7 max-w-full lg:max-w-[520px] mb-6 sm:mb-8"
              style={{
                fontFamily: "var(--font-figtree), Figtree",
                color: 'var(--color-text-secondary)'
              }}
            >
              {subheadline}
            </p>

            <ul className="flex flex-col sm:flex-row gap-3 sm:gap-1.5 flex-wrap mt-6 sm:mt-10">
              <li className="flex-1 sm:flex-none">
                <a
                  href={primaryButtonHref}
                  className="block w-full sm:w-auto cursor-pointer text-white rounded-full px-6 sm:px-[18px] py-3 sm:py-[15px] text-base leading-4 whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:rounded-2xl text-center"
                  style={{
                    backgroundColor: 'var(--color-primary-action)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-action-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-action)'}
                >
                  {primaryButtonText}
                </a>
              </li>
              <li className="flex-1 sm:flex-none">
                <a
                  href={secondaryButtonHref}
                  className="block w-full sm:w-auto cursor-pointer border rounded-full px-6 sm:px-[18px] py-3 sm:py-[15px] text-base leading-4 whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:rounded-2xl text-center"
                  style={{
                    borderColor: 'var(--color-text-primary)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {secondaryButtonText}
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              ease: [0.645, 0.045, 0.355, 1],
              delay: 0.2,
            }}
            className="w-full lg:w-1/2 bg-white rounded-2xl sm:rounded-[40px] flex justify-center items-center min-h-[400px] sm:min-h-[500px] lg:aspect-square overflow-hidden"
            style={{
              backgroundImage: "url(/heromodel.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
      </div>
    </section>
  )
}
