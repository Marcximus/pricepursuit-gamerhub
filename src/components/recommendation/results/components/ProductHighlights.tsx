
import React from 'react';

interface HighlightItem {
  text: string;
  icon: React.ReactNode;
}

interface ProductHighlightsProps {
  highlights: HighlightItem[];
}

export const ProductHighlights: React.FC<ProductHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return <div className="mb-4 h-full"></div>;
  
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2">Highlights</h3>
      <ul className="grid grid-cols-1 gap-2">
        {highlights.map((highlight, index) => (
          <li key={index} className="flex items-center text-sm p-1 rounded-md transition-colors hover:bg-gray-50">
            <span className="text-primary mr-2 flex-shrink-0">{highlight.icon}</span>
            <span className="text-emerald-600 font-medium line-clamp-2">{highlight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
