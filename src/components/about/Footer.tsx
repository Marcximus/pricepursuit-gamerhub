
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Footer = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`bg-gray-50 py-8 text-center ${isMobile ? 'px-4' : ''}`}>
      <p className="text-gray-600">
        © {new Date().getFullYear()} Laptop Hunter • Made with 💻 for people who love 💻
      </p>
      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 mt-2`}>
        P.S. No laptops were harmed in the making of this website. They were all treated ethically and released back into the wild after data collection. 🌿
      </p>
    </div>
  );
};

export default Footer;
