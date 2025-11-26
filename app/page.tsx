import { PortfolioNavbar } from "@/components/PortfolioNavbar"
import { BentoHero } from "@/components/BentoHero"
import { ProductTeaserCard } from "@/components/ProductTeaserCard"
import { BankingScaleHero } from "@/components/BankingScaleHero"
import { CaseStudiesCarousel } from "@/components/CaseStudiesCarousel"
import { IntegrationCarousel } from "@/components/IntegrationCarousel"
import { PricingSection } from "@/components/PricingSection"
import { FAQSection } from "@/components/FAQSection"
import { Footer } from "@/components/Footer"

export default function Page() {
  return (
    <>
      {/* <PortfolioNavbar /> */}
      <BentoHero />
      <ProductTeaserCard />
      <BankingScaleHero />
      <CaseStudiesCarousel />
      <IntegrationCarousel />
      <PricingSection />
      <FAQSection />
      <Footer />
    </>
  )
}
