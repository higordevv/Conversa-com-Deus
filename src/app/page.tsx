import { MainSection,FeaturesSection, PricingPlansSection } from "@components/index";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
     <MainSection />
     <FeaturesSection />
     <PricingPlansSection />
    </main>
  )
}
