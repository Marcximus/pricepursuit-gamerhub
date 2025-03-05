
import React from 'react';

interface HighlightItem {
  text: string;
  icon: React.ReactNode;
}

interface ProductHighlightsProps {
  highlights: HighlightItem[];
}

export const ProductHighlights: React.FC<ProductHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;
  
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-800 mb-2">Highlights</h3>
      <ul className="grid grid-cols-1 gap-2">
        {highlights.map((highlight, index) => (
          <li key={index} className="flex items-center text-sm text-gray-700 p-1 rounded-md transition-colors hover:bg-gray-50">
            <span className="text-primary mr-2">{highlight.icon}</span>
            {highlight.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
