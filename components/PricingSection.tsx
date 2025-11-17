"use client"

import * as React from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

type PlanLevel = "starter" | "pro" | "enterprise"

interface PricingFeature {
  name: string
  included: PlanLevel | "all"
}

interface PricingPlan {
  name: string
  level: PlanLevel
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
}

const features: PricingFeature[] = [
  { name: "Video to content transformation", included: "starter" },
  { name: "Up to 10 videos/month", included: "starter" },
  { name: "Basic social media formats (Twitter, LinkedIn)", included: "starter" },
  { name: "Email support", included: "starter" },
  { name: "All social media platforms (Facebook, Instagram, TikTok)", included: "pro" },
  { name: "Up to 50 videos/month", included: "pro" },
  { name: "AI-powered virality scoring", included: "pro" },
  { name: "Priority support", included: "pro" },
  { name: "Custom content templates", included: "enterprise" },
  { name: "Unlimited videos", included: "enterprise" },
  { name: "White-label solution", included: "enterprise" },
  { name: "24/7 dedicated support", included: "enterprise" },
  { name: "API access", included: "all" },
  { name: "Batch processing", included: "all" },
  { name: "Content calendar integration", included: "all" },
]

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: 19, yearly: 190 },
    level: "starter",
  },
  {
    name: "Pro",
    price: { monthly: 49, yearly: 490 },
    level: "pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 149, yearly: 1490 },
    level: "enterprise",
  },
]

function shouldShowCheck(included: PricingFeature["included"], level: PlanLevel): boolean {
  if (included === "all") return true
  if (included === "enterprise" && level === "enterprise") return true
  if (included === "pro" && (level === "pro" || level === "enterprise")) return true
  if (included === "starter") return true
  return false
}

export function PricingSection() {
  const [isYearly, setIsYearly] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>("pro")

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-figtree text-[40px] font-normal leading-tight mb-4" style={{ color: 'var(--color-text-primary)' }}>Transform Your Videos Into Viral Content</h2>
          <p className="font-figtree text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your content creation needs. Turn one video into multiple platform-optimized posts with AI-powered content generation.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2 rounded-full font-figtree text-lg transition-all",
                !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full font-figtree text-lg transition-all",
                isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Yearly
              <span className="ml-2 text-sm" style={{ color: 'var(--color-primary-action)' }}>Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => setSelectedPlan(plan.level)}
              className={cn(
                "relative p-8 rounded-2xl text-left transition-all border-2",
                selectedPlan === plan.level
                  ? "bg-primary/5"
                  : "border-border hover:border-primary/50",
              )}
              style={selectedPlan === plan.level ? { borderColor: 'var(--color-primary-action)', backgroundColor: 'rgba(22, 109, 149, 0.05)' } : {}}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-figtree" style={{ backgroundColor: 'var(--color-primary-action)' }}>
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="font-figtree text-2xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-figtree text-4xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="font-figtree text-lg text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                </div>
              </div>
              <div
                className={cn(
                  "w-full py-3 px-6 rounded-full font-figtree text-lg transition-all text-center text-white",
                  selectedPlan === plan.level ? "bg-primary text-white" : "bg-secondary text-foreground",
                )}
                style={selectedPlan === plan.level ? { backgroundColor: 'var(--color-primary-action)' } : {}}
              >
                {selectedPlan === plan.level ? "Selected" : "Select Plan"}
              </div>
            </button>
          ))}
        </div>

        {/* Features Table */}
        <div className="border rounded-2xl overflow-hidden bg-card" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="overflow-x-auto">
            <div className="min-w-[768px]">
              {/* Table Header */}
              <div className="flex items-center p-6 bg-secondary border-b" style={{ borderColor: 'var(--color-border-light)' }}>
                <div className="flex-1">
                  <h3 className="font-figtree text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>Features</h3>
                </div>
                <div className="flex items-center gap-8">
                  {plans.map((plan) => (
                    <div key={plan.level} className="w-24 text-center font-figtree text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Rows */}
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className={cn(
                    "flex items-center p-6 transition-colors",
                    index % 2 === 0 ? "bg-background" : "bg-secondary/30",
                  )}
                  style={feature.included === selectedPlan ? { backgroundColor: 'rgba(22, 109, 149, 0.05)' } : {}}
                >
                  <div className="flex-1">
                    <span className="font-figtree text-lg" style={{ color: 'var(--color-text-primary)' }}>{feature.name}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    {plans.map((plan) => (
                      <div key={plan.level} className="w-24 flex justify-center">
                        {shouldShowCheck(feature.included, plan.level) ? (
                          <div className="w-6 h-6 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-action)' }}>
                            <CheckIcon className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <button className="text-white px-[18px] py-[15px] rounded-full font-figtree text-lg hover:rounded-2xl transition-all" style={{ backgroundColor: 'var(--color-primary-action)' }}>
            Get started with {plans.find((p) => p.level === selectedPlan)?.name}
          </button>
        </div>
      </div>
    </section>
  )
}
