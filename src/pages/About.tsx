
import React from 'react';
import Navigation from '@/components/Navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AboutHero,
  MissionSection,
  OriginStorySection,
  PersonalRecommendationSection,
  CompareLaptopsSection,
  ShoppingPhilosophySection,
  ServiceAudienceSection,
  ComparisonTableSection,
  CommunitySection,
  DifferenceSection,
  FunFactsSection,
  ContactSection,
  FAQSection,
  LegalSection,
  CtaSection,
  Footer
} from '@/components/about';

const About = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className={`${isMobile ? 'pt-20 pb-12 px-4' : 'pt-32 pb-16 px-4 sm:px-6 lg:px-8'} max-w-7xl mx-auto`} role="main">
        <AboutHero />
        <MissionSection />
        <OriginStorySection />
        <PersonalRecommendationSection />
        <CompareLaptopsSection />
        <ShoppingPhilosophySection />
        <ServiceAudienceSection />
        <ComparisonTableSection />
        <CommunitySection />
        <DifferenceSection />
        <FunFactsSection />
        <ContactSection />
        <FAQSection />
        <LegalSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default About;
