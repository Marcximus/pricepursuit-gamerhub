
import React from 'react';
import { ShineBorder } from '@/components/ui/shine-border';
import { Check, Sparkle, Star } from 'lucide-react';

interface HighlightItem {
  text: string;
  icon: React.ReactNode;
}

interface ProductHighlightsProps {
  highlights: HighlightItem[];
}

export const ProductHighlights: React.FC<ProductHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return <div className="mb-4 h-full"></div>;
  
  // Take exactly 3 highlights (or fewer if not available)
  const displayHighlights = highlights.slice(0, 3);
  
  // If we have fewer than 3 highlights, pad with empty ones to maintain layout
  const paddedHighlights = [...displayHighlights];
  while (paddedHighlights.length < 3) {
    paddedHighlights.push({ 
      text: "", 
      icon: null 
    });
  }
  
  // Default icons if needed
  const defaultIcons = [
    <Star className="h-4 w-4" key="star" />,
    <Check className="h-4 w-4" key="check" />,
    <Sparkle className="h-4 w-4" key="sparkle" />
  ];
  
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2">Highlights</h3>
      <ul className="grid grid-cols-1 gap-2">
        {paddedHighlights.map((highlight, index) => (
          highlight.text ? (
            <li 
              key={index} 
              className="flex items-center text-sm p-2 rounded-md bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 shadow-sm hover:shadow transition-all"
            >
              <span className="text-primary mr-2 flex-shrink-0">
                {highlight.icon || defaultIcons[index % defaultIcons.length]}
              </span>
              <span className="text-blue-700 font-medium line-clamp-2">{highlight.text}</span>
            </li>
          ) : (
            <li key={index} className="h-[42px]"></li> // Empty placeholder with same height
          )
        ))}
      </ul>
    </div>
  );
};
