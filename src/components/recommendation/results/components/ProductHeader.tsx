
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
      <div className="absolute -top-3 left-4">
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-b-md z-10 flex items-center gap-1.5 shadow-sm animate-pulse">
          {index === 0 ? <Cpu className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
          <span className="font-medium text-sm">Recommendation {index + 1}</span>
        </div>
      </div>
    </div>
  );
};
