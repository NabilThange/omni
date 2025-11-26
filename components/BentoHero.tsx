"use client"

import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, Users, Globe, Sparkles, Play } from "lucide-react"
import Image from "next/image"

export function BentoHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  }

  return (
    <section className="w-full pt-4 md:pt-6 lg:pt-8 pb-8 md:pb-12 lg:pb-16 px-4 md:px-6 bg-[var(--color-bg-page)]">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 lg:gap-5 auto-rows-[minmax(140px,auto)] md:auto-rows-[minmax(160px,auto)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Content Block - Top Left */}
        <motion.div
          className="md:col-span-7 lg:col-span-8 row-span-2 bg-[#e9e9e9] dark:bg-neutral-900 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden shadow-sm"
          variants={itemVariants}
        >
          <div className="z-10 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 w-fit"
            >
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen AI Content Engine</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[var(--color-text-primary)] mb-4 md:mb-6 leading-[1.1]">
              One Video, 
              <br />
              <span className="text-primary">Infinite Content Opportunities</span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-[var(--color-text-secondary)] max-w-lg mb-6 md:mb-8 leading-relaxed">
              Convert any long-form YouTube video into written content for every platform — or automatically cut it into high-impact short clips. Choose your workflow and let Vyx do the rest.
            </p>

            <ul className="flex flex-col sm:flex-row gap-3 sm:gap-2 flex-wrap mt-4 sm:mt-6 lg:mt-8">
              <li className="flex-1 sm:flex-none">
                <a
                  href="/repurpose"
                  className="block w-full sm:w-auto cursor-pointer text-white rounded-full px-6 sm:px-[18px] py-3 sm:py-[15px] text-base leading-4 whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:rounded-2xl text-center"
                  style={{
                    backgroundColor: 'var(--color-primary-action)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-action-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-action)')}
                >
                  Start Repurposing
                </a>
              </li>
              <li className="flex-1 sm:flex-none">
                <a
                  href="#features"
                  className="block w-full sm:w-auto cursor-pointer border rounded-full px-6 sm:px-[18px] py-3 sm:py-[15px] text-base leading-4 whitespace-nowrap transition-all duration-150 ease-[cubic-bezier(0.455,0.03,0.515,0.955)] hover:rounded-2xl text-center"
                  style={{
                    borderColor: 'var(--color-text-primary)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  View Examples
                </a>
              </li>
            </ul>
          </div>

          {/* Abstract Background Shapes */}
          <motion.div
            className="absolute -right-20 -top-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.div
            className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, 20, 0],
            }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </motion.div>

        {/* Right Side Vertical Feature - Tall Card */}
        <motion.div
          className="md:col-span-5 lg:col-span-4 row-span-2 md:row-span-3 bg-[var(--color-neutral-900)] dark:bg-neutral-800 rounded-2xl md:rounded-3xl overflow-hidden relative group min-h-[280px] md:min-h-[320px] lg:min-h-[360px]"
          variants={itemVariants}
        >
          <Image
            src="/sc4.png"
            alt="Platform Interface"
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-5 md:p-6 lg:p-8 flex flex-col justify-end">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white text-xl md:text-2xl font-bold mb-1 md:mb-2">AI Content Repurposing</h3>
              <p className="text-white/80 text-sm md:text-base">One long-form video becomes a complete content bundle — blogs, posts, scripts, reels, and image prompts.</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Left - Feature Card 1 */}
        <motion.div
          className="md:col-span-4 lg:col-span-3 bg-[#e9e9e9] dark:bg-neutral-900 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 flex flex-col justify-between group hover:shadow-md transition-shadow"
          variants={itemVariants}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center mb-3 md:mb-4 text-[var(--color-primary-action)]">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mb-0.5 md:mb-1">+10X</h3>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)]">Content Output Per Video</p>
          </div>
        </motion.div>

        {/* Bottom Left - Feature Card 2 */}
        <motion.div
          className="md:col-span-3 lg:col-span-2 bg-[#e9e9e9] dark:bg-neutral-900 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 flex flex-col justify-between group hover:shadow-md transition-shadow"
          variants={itemVariants}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center mb-3 md:mb-4 text-[var(--color-primary-action)]">
            <Users className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mb-0.5 md:mb-1">5+</h3>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)]">Content Formats Generated</p>
          </div>
        </motion.div>

        {/* Bottom Left - Feature Card 3 */}
        <motion.div
          className="md:col-span-5 lg:col-span-3 bg-[var(--color-primary-action)] text-white rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 flex flex-row items-center justify-between relative overflow-hidden group cursor-pointer"
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
        >
          <div className="z-10">
            <h3 className="text-lg md:text-xl font-bold mb-0.5 md:mb-1">&lt; 2 min</h3>
            <p className="text-white/80 text-xs md:text-sm">Average Processing Time</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center z-10">
            <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>

          {/* Decorative Map Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('/placeholder.svg')] bg-repeat opacity-20" />
        </motion.div>
      </motion.div>
    </section>
  )
}
