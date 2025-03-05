
import React from 'react';

interface ProductTitleProps {
  title: string;
  url: string;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({ title, url }) => {
  return (
    <a 
      href={url}
      target="_blank" 
      rel="noopener noreferrer" 
      className="block hover:text-blue-700 transition-colors"
    >
      <h2 className="text-xl font-bold mb-2 line-clamp-2 group">
        {title}
        <span className="block h-0.5 w-0 group-hover:w-full bg-blue-600 transition-all duration-300"></span>
      </h2>
    </a>
  );
};
