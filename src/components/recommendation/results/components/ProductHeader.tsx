
import React from 'react';
import { Cpu, Zap } from 'lucide-react';

interface ProductHeaderProps {
  title: string;
  productUrl: string;
  index: number;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ title, productUrl, index }) => {
  return (
    <div className="relative mb-2">
      <div className="absolute top-0 left-0 right-0 flex justify-center">
        <div className="bg-blue-600 text-white px-4 py-1.5 rounded-b-md z-10 flex items-center gap-2 shadow-md transform hover:scale-105 transition-transform">
          {index === 0 ? <Cpu className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          <span className="font-medium">Recommendation {index + 1}</span>
        </div>
      </div>
    </div>
  );
};
