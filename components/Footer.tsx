"use client"
import { Github, Twitter, Linkedin, Mail, Globe } from 'lucide-react'
import { motion } from "framer-motion"

type FooterLink = {
  label: string
  href: string
}

type FooterSection = {
  title: string
  links: FooterLink[]
}

type FooterProps = {
  companyName?: string
  tagline?: string
  sections?: FooterSection[]
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
    email?: string
    portfolio?: string
  }
  copyrightText?: string
}

const defaultSections: FooterSection[] = []

export const Footer = ({
  companyName = "Omni",
  tagline = "Transform Videos Into Multi-Platform Content",
  sections = defaultSections,
  socialLinks = {
    twitter: "https://x.com/THEONLYNABIL",
    linkedin: "https://www.linkedin.com/in/nabil-thange/",
    github: "https://github.com/NabilThange",
    email: "thangenbail@gmail.com",
    portfolio: "https://nabil-thange.vercel.app/",
  },
  copyrightText,
}: FooterProps) => {
  const currentYear = new Date().getFullYear()
  const copyright = copyrightText || `© ${currentYear} ${companyName}. All rights reserved.`
  return (
    <footer className="w-full border-t" style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border-light)' }}>
      <div className="max-w-[1200px] mx-auto px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="col-span-2"
          >
            <div className="mb-4">
              <h3
                className="text-2xl font-semibold mb-2"
                style={{ fontFamily: "Figtree", fontWeight: "500", color: 'var(--color-text-primary)' }}
              >
                {companyName}
              </h3>
              <p className="text-sm leading-5 max-w-xs" style={{ fontFamily: "Figtree", color: 'var(--color-text-tertiary)' }}>
                {tagline}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border transition-colors duration-150"
                  style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                    e.currentTarget.style.borderColor = 'var(--color-text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--color-border-light)'
                  }}
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border transition-colors duration-150"
                  style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                    e.currentTarget.style.borderColor = 'var(--color-text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--color-border-light)'
                  }}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border transition-colors duration-150"
                  style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                    e.currentTarget.style.borderColor = 'var(--color-text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--color-border-light)'
                  }}
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {socialLinks.email && (
                <a
                  href={`mailto:${socialLinks.email}`}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border transition-colors duration-150"
                  style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                    e.currentTarget.style.borderColor = 'var(--color-text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--color-border-light)'
                  }}
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
              {socialLinks.portfolio && (
                <a
                  href={socialLinks.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border transition-colors duration-150"
                  style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                    e.currentTarget.style.borderColor = 'var(--color-text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)'
                    e.currentTarget.style.borderColor = 'var(--color-border-light)'
                  }}
                  aria-label="Portfolio"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>

          {/* Link Sections */}
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="col-span-1"
            >
              <h4
                className="text-sm font-medium mb-4 uppercase tracking-wide"
                style={{ fontFamily: "Figtree", fontWeight: "500", color: 'var(--color-text-primary)' }}
              >
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-150"
                      style={{ fontFamily: "Figtree", color: 'var(--color-text-tertiary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="pt-8 border-t"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-sm" style={{ fontFamily: "Figtree", color: 'var(--color-text-tertiary)' }}>
                {copyright}
              </p>
              <p className="text-sm font-medium" style={{ fontFamily: "Figtree", color: 'var(--color-primary-action)' }}>
                Built for AI GENESIS - LARGEST AI HACKATHON IN THE MIDDLE EAST
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
