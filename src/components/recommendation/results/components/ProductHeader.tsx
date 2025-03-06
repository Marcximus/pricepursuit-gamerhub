
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
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-4 text-white relative z-20">
      <h3 className="text-lg font-semibold">
        Recommendation {index + 1}
      </h3>
    </div>
  );
};
