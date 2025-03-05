
import React from 'react';

interface ProductHeaderProps {
  title: string;
  productUrl: string;
  index: number;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ title, productUrl, index }) => {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1 rounded-br-md z-10">
        Recommendation {index + 1}
      </div>
    </div>
  );
};
