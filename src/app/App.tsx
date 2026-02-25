import { ProgressBar } from "./components/ProgressBar";
import { NavHeader } from "./components/NavHeader";
import { HeroSection } from "./components/HeroSection";
import { ProblemSection } from "./components/ProblemSection";
import { AnalyticsSection } from "./components/AnalyticsSection";
import { SimulationsSection } from "./components/SimulationsSection";
import { ComparisonSection } from "./components/ComparisonSection";
import { TrustSection } from "./components/TrustSection";
import { FooterSection } from "./components/FooterSection";
import { ExitIntentPopup } from "./components/ExitIntentPopup";

export default function App() {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "#0A0F1E",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <ProgressBar />
      <NavHeader />
      <HeroSection />
      <ProblemSection />
      <AnalyticsSection />
      <SimulationsSection />
      <ComparisonSection />
      <TrustSection />
      <FooterSection />
      <ExitIntentPopup />
    </div>
  );
}
