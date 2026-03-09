import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import FutureSection from "@/components/FutureSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="bg-background min-h-screen">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FutureSection />
      <Footer />
    </main>
  );
};

export default Index;
