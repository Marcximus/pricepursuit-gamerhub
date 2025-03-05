
import React from 'react';
import { formatRecommendationReason } from '../utils/textFormatter';

interface ProductReasonProps {
  reason: string;
}

export const ProductReason: React.FC<ProductReasonProps> = ({ reason }) => {
  const formattedParagraphs = formatRecommendationReason(reason);
  
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h3>
      {formattedParagraphs.map((paragraph, i) => (
        <p key={i} className="text-gray-600 text-sm mb-2 last:mb-0">{paragraph}</p>
      ))}
    </div>
  );
};
