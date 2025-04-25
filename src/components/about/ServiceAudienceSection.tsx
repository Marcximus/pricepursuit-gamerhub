
import React from 'react';
import { Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ServiceAudienceSection = () => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center mb-6">
        <Users className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gaming-600 mr-2`} />
        <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Who Our Service Is For 👥</h2>
      </div>
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4 px-4' : 'md:grid-cols-4 gap-6'} max-w-5xl mx-auto`}>
        <div className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center bg-red-50">
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-3`}>Students 🎓</h3>
          <p className="text-gray-600">Find affordable, reliable laptops that'll survive four years of classes, research, and the occasional coffee spill.</p>
        </div>
        <div className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center bg-emerald-50">
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-3`}>Professionals 💼</h3>
          <p className="text-gray-600">Discover high-performance machines that can handle your workload without breaking the bank.</p>
        </div>
        <div className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center bg-blue-50">
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-3`}>Gamers 🎮</h3>
          <p className="text-gray-600">Level up with laptops that deliver frame rates and graphics worthy of your gaming skills.</p>
        </div>
        <div className="p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center bg-yellow-50">
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-3`}>Creatives 🎨</h3>
          <p className="text-gray-600">Edit, design, and create on laptops with the color accuracy and processing power your projects deserve.</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceAudienceSection;
