
import React from 'react';
import { formatRecommendationReason } from '../utils/textFormatter';

interface ProductReasonProps {
  reason: string;
}

export const ProductReason: React.FC<ProductReasonProps> = ({ reason }) => {
  const formattedParagraphs = formatRecommendationReason(reason);
  
  return (
    <div className="animate-fade-in">
      <h3 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h3>
      <div className="text-gray-600 text-sm">
        {formattedParagraphs.map((paragraph, i) => (
          <p key={i} className="mb-3 last:mb-0 leading-relaxed">{paragraph}</p>
        ))}
      </div>
    </div>
  );
};
