
import React from 'react';

interface ProductHeaderProps {
  title: string;
  productUrl: string;
  index: number;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  title, 
  productUrl,
  index
}) => {
  return (
    <div className="px-5 py-4 relative z-10 shadow-sm border-b border-gray-100">
      <h3 className={`text-lg font-semibold animate-pulse text-green-500 ${
        index === 1 ? 'text-right' : 'text-left'
      }`}>
        Recommendation {index + 1}
      </h3>
    </div>
  );
};
