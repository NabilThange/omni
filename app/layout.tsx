import type React from "react"
import type { Metadata } from "next"
import { Figtree, Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/header"
import "./globals.css"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Vyx - AI-Powered Content Repurposing Platform",
  description: "Transform your long-form videos into multi-platform ready content. Get instant virality scores, usefulness metrics, and downloadable packages.",
  generator: "v0.app",
  icons: {
    icon: "/vyxlogo.png",
  },
  openGraph: {
    title: "Vyx - AI-Powered Content Repurposing Platform",
    description: "Transform your long-form videos into multi-platform ready content. Get instant virality scores, usefulness metrics, and downloadable packages.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyx - AI-Powered Content Repurposing Platform",
    description: "Transform your long-form videos into multi-platform ready content. Get instant virality scores, usefulness metrics, and downloadable packages.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${figtree.variable} ${geistMono.variable} font-sans antialiased`}>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
