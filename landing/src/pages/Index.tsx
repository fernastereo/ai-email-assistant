import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works";
import { WaitlistSection } from "@/components/waitlist-section";
import { Footer } from "@/components/footer";
import { Differentiation } from '@/components/differentiation';

const Index = () => {
  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main>
        <HeroSection />
        <div id='features'>
          <FeaturesSection />
        </div>
        <div id='how-it-works'>
          <HowItWorksSection />
        </div>
        <Differentiation />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
