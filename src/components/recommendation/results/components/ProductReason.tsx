
import React from 'react';
import { formatRecommendationReason } from '../utils/textFormatter';

interface ProductReasonProps {
  reason: string;
}

export const ProductReason: React.FC<ProductReasonProps> = ({ reason }) => {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h3>
      {formatRecommendationReason(reason)}
    </div>
  );
};
