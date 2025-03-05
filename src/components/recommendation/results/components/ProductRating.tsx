
import React from 'react';
import { Star } from 'lucide-react';

interface ProductRatingProps {
  rating: number;
  ratingCount: number;
  isPrime?: boolean;
  url: string;
}

export const ProductRating: React.FC<ProductRatingProps> = ({ 
  rating, 
  ratingCount, 
  isPrime, 
  url 
}) => {
  return (
    <a 
      href={url}
      target="_blank" 
      rel="noopener noreferrer"
      className="block mb-4"
    >
      <div className="flex items-center">
        <div className="flex items-center text-amber-500">
          <Star className="fill-current w-4 h-4" />
          <span className="ml-1 font-medium">{rating}</span>
        </div>
        <span className="mx-2 text-gray-400">|</span>
        <span className="text-gray-600 text-sm">{ratingCount.toLocaleString()} ratings</span>
        
        {isPrime && (
          <>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-blue-600 text-sm font-medium">Prime</span>
          </>
        )}
      </div>
    </a>
  );
};
