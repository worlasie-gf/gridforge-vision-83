import { useState } from "react";

import Footer from "@/components/Footer";
import FutureSection from "@/components/FutureSection";
import HeroSection from "@/components/HeroSection";
import HowWeFitSection from "@/components/HowWeFitSection";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import ProblemSection from "@/components/ProblemSection";
import TripleWinSection from "@/components/TripleWinSection";
import TrustLadderSection from "@/components/TrustLadderSection";
import WhoWeServeSection from "@/components/WhoWeServeSection";
import WhyItMattersSection from "@/components/WhyItMattersSection";

const Index = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <main className="bg-background min-h-screen">
      <HeroSection />
      <ProblemSection />
      <WhyItMattersSection />
      <HowWeFitSection />
      <TrustLadderSection />
      <TripleWinSection />
      <WhoWeServeSection />
      <FutureSection onLeadCaptureOpen={() => setIsLeadModalOpen(true)} />
      <Footer />
      <LeadCaptureModal
        open={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
      />
    </main>
  );
};

export default Index;
