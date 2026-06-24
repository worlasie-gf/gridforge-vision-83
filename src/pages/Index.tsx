import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import WhyItMattersSection from "@/components/WhyItMattersSection";
import HowWeFitSection from "@/components/HowWeFitSection";
import TrustLadderSection from "@/components/TrustLadderSection";
import TripleWinSection from "@/components/TripleWinSection";
import WhoWeServeSection from "@/components/WhoWeServeSection";
import FutureSection from "@/components/FutureSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="bg-background min-h-screen">
      <HeroSection />
      <ProblemSection />
      <WhyItMattersSection />
      <HowWeFitSection />
      <TrustLadderSection />
      <TripleWinSection />
      <WhoWeServeSection />
      <FutureSection />
      <Footer />
    </main>
  );
};

export default Index;
