
import React from 'react';
import Navigation from '@/components/Navigation';
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
  CtaSection,
  Footer
} from '@/components/about';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
        <CtaSection />
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
