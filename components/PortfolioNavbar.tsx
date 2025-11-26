"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useScrollDirection } from "@/hooks/use-scroll-direction"

const navigationLinks = [
  {
    name: "Features",
    href: "#features",
  },
  {
    name: "Pricing",
    href: "#pricing",
  },
  {
    name: "Solutions",
    href: "#solutions",
  },
  {
    name: "Resources",
    href: "#resources",
  },
] as any[]

// @component: PortfolioNavbar
export const PortfolioNavbar = () => {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollDirection, isAtTop } = useScrollDirection()

  const isNavbarVisible = scrollDirection === "up" || isAtTop

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleLinkClick = (href: string) => {
    closeMobileMenu()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      })
    }
  }

  const handleLogoClick = () => {
    router.push("/")
  }

  // @return
  return (
    <motion.nav
      animate={{
        y: isNavbarVisible ? 0 : -100,
        opacity: isNavbarVisible ? 1 : 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <div
        className={`max-w-6xl mx-auto rounded-full transition-all duration-300 border border-border/20 shadow-sm ${isAtTop ? "bg-background/60 backdrop-blur-sm" : "bg-background/95 backdrop-blur-md"}`}
      >
        <div className="flex items-center justify-between h-[66px] px-6">
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
            >
              <img src="/vyxlogo.png" alt="Vyx Logo" className="h-6 w-auto" />
              <span
                className="text-lg font-bold text-foreground hidden sm:inline"
                style={{
                  fontFamily: "Figtree",
                  fontWeight: "800",
                }}
              >
                VYX
              </span>
            </button>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.href)}
                  className="text-foreground hover:text-primary hover:bg-primary/10 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full"
                  style={{
                    fontFamily: "Figtree, sans-serif",
                    fontWeight: "500",
                  }}
                >
                  <span>{link.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <button
              onClick={() => handleLinkClick("#contact")}
              className="text-white px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              style={{
                fontFamily: "Figtree",
                fontWeight: "600",
                backgroundColor: "var(--color-primary-action)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-action-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-action)")}
            >
              Start Using Vyx
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-foreground hover:text-primary p-2 rounded-full transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="md:hidden bg-background/95 backdrop-blur-md border border-border rounded-3xl mt-2 max-w-6xl mx-auto overflow-hidden"
          >
            <div className="px-6 py-6 space-y-3">
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.href)}
                  className="block w-full text-left text-foreground hover:text-primary hover:bg-primary/10 py-3 px-4 text-base font-medium transition-all duration-200 rounded-full"
                  style={{
                    fontFamily: "Figtree, sans-serif",
                    fontWeight: "500",
                  }}
                >
                  <span>{link.name}</span>
                </button>
              ))}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => handleLinkClick("#contact")}
                  className="w-full text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-200"
                  style={{
                    fontFamily: "Figtree",
                    fontWeight: "600",
                    backgroundColor: "var(--color-primary-action)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-action-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-action)")}
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
