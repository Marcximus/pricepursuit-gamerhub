
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
  // Different gradient backgrounds for each recommendation
  const gradientClass = index === 0 
    ? "bg-gradient-to-r from-blue-500 to-green-500" 
    : "bg-gradient-to-r from-purple-500 to-pink-500";
    
  return (
    <div className={`px-5 py-4 relative z-10 shadow-sm border-b border-gray-100 ${gradientClass}`}>
      <h3 className={`text-lg font-semibold text-white ${
        index === 1 ? 'text-right' : 'text-left'
      }`}>
        Recommendation {index + 1}
      </h3>
    </div>
  );
};
