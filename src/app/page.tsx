import {
  MainSection,
  FeaturesSection,
  PricingPlansSection,
  FooterSection,
} from "@components/index";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <MainSection />
      <FeaturesSection />
      <PricingPlansSection />
      <FooterSection />
    </main>
  );
}
