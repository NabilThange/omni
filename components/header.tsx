"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { VyxLogo } from "./vyx-logo"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features " },
  { label: "Solution", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
]

// Routes where navbar should be hidden
const hiddenRoutes = ["/upload", "/clips"]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Hide navbar on specific routes
  if (hiddenRoutes.includes(pathname)) {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="relative z-50">
      <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 max-w-5xl mx-auto">
        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="-ml-2.5">
          <VyxLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 mr-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                isActive(item.href) ? "bg-vyx-cream text-vyx-dark-text" : "text-vyx-dark-text hover:bg-vyx-cream/50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-vyx-dark-text p-2 rounded-lg hover:bg-vyx-cream/50 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-vyx-cream/95 backdrop-blur-sm border-t border-vyx-green/10"
          >
            <nav className="flex flex-col px-6 py-4 gap-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive(item.href) ? "bg-vyx-green text-white" : "text-vyx-dark-text hover:bg-vyx-green/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
