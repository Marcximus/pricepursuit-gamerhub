
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const AboutHero = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="text-center mb-12">
      <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl sm:text-5xl md:text-6xl'} font-extrabold tracking-tight text-gray-900`}>
        About <span className="text-gaming-600">Laptop Hunter</span> 💻
      </h1>
      <p className={`mt-3 ${isMobile ? 'text-lg px-2' : 'text-xl md:text-2xl'} max-w-md mx-auto text-gray-500 md:mt-5 md:max-w-3xl`}>
        Your trusted companion in the digital wilderness of laptop shopping!
      </p>
    </div>
  );
};

export default AboutHero;
