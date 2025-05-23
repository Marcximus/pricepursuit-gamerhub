
import React from 'react';

interface ProductPriceProps {
  currentPrice: string;
  originalPrice?: string;
  discountPercentage?: number;
  deliveryInfo?: string;
  url: string;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({ 
  currentPrice, 
  originalPrice, 
  discountPercentage,
  deliveryInfo,
  url
}) => {
  // Handle unavailable cases
  const isUnavailable = currentPrice.includes('not available') || 
                        currentPrice === 'N/A' || 
                        currentPrice === 'Availability Unknown' ||
                        currentPrice === 'Click for current price';

  return (
    <div>
      <a 
        href={url}
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
      >
        {isUnavailable ? (
          <div className="text-sm text-blue-600 hover:text-blue-800">
            Availability Unknown
          </div>
        ) : (
          <div className="text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors">
            {currentPrice}
          </div>
        )}
        
        {originalPrice && discountPercentage && !isUnavailable ? (
          <div className="text-sm text-gray-500">
            <span className="line-through">{originalPrice}</span>
            {' '}
            <span className="text-green-600 font-medium animate-pulse">
              {discountPercentage}% off
            </span>
          </div>
        ) : null}
      </a>
      
      {deliveryInfo && (
        <div className="text-sm text-gray-600 mt-1">
          {deliveryInfo}
        </div>
      )}
    </div>
  );
};
