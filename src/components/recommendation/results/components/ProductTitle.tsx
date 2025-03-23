
import React from 'react';

interface ProductTitleProps {
  title: string;
  url: string;
  rank?: number;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({ title, url, rank }) => {
  // Format the title with ranking if provided
  const displayTitle = rank ? `#${rank} ${title}` : title;
  
  return (
    <a 
      href={url}
      target="_blank" 
      rel="noopener noreferrer" 
      className="block hover:text-blue-700 transition-colors"
    >
      <h2 className="text-xl font-bold mb-2 line-clamp-2 group">
        {displayTitle}
        <span className="block h-0.5 w-0 group-hover:w-full bg-blue-600 transition-all duration-300"></span>
      </h2>
    </a>
  );
};
