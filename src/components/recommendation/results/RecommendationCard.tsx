
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, Star } from 'lucide-react';
import { RecommendationResult } from '../types/quizTypes';

interface RecommendationCardProps {
  result: RecommendationResult;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  result,
  index
}) => {
  const handleViewOnAmazon = (url: string) => {
    window.open(url, '_blank');
  };
  
  // Format price for display
  const formatPrice = (price: string | number | null | undefined): string => {
    if (price === null || price === undefined || price === 0 || price === '0') {
      return `$${result.recommendation.priceRange.min} - $${result.recommendation.priceRange.max}`;
    }
    
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    
    if (typeof price === 'string') {
      if (price.startsWith('$')) return price;
      return `$${price}`;
    }
    
    return `$${result.recommendation.priceRange.min} - $${result.recommendation.priceRange.max}`;
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="relative">
        <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1 rounded-br-md">
          Recommendation {index + 1}
        </div>
        
        {result.product ? (
          <div className="h-64 bg-gray-100 flex items-center justify-center p-6">
            <img 
              src={result.product.product_photo} 
              alt={result.product.product_title} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center p-6">
            <div className="text-gray-400 text-center">
              <p className="font-semibold mb-2">Image not available</p>
              <p className="text-sm">{result.recommendation.model}</p>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-2 line-clamp-2">
          {result.product ? result.product.product_title : result.recommendation.model}
        </h2>
        
        {result.product && (
          <div className="flex items-center mb-4">
            <div className="flex items-center text-amber-500">
              <Star className="fill-current w-4 h-4" />
              <span className="ml-1 font-medium">{result.product.product_star_rating}</span>
            </div>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-gray-600 text-sm">{result.product.product_num_ratings.toLocaleString()} ratings</span>
            
            {result.product.is_prime && (
              <>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-blue-600 text-sm font-medium">Prime</span>
              </>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <div className="text-2xl font-bold text-blue-700">
            {result.product ? formatPrice(result.product.product_price) : `$${result.recommendation.priceRange.min} - $${result.recommendation.priceRange.max}`}
          </div>
          
          {result.product && result.product.product_original_price && (
            <div className="text-sm text-gray-500">
              <span className="line-through">{formatPrice(result.product.product_original_price)}</span>
              {' '}
              <span className="text-green-600 font-medium">
                {calculateDiscount(result.product.product_price, result.product.product_original_price)}% off
              </span>
            </div>
          )}
          
          {result.product && result.product.delivery && (
            <div className="text-sm text-gray-600 mt-1">
              {result.product.delivery}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h3>
          <p className="text-gray-600 text-sm">{result.recommendation.reason}</p>
        </div>
        
        <div className="flex flex-col space-y-3">
          {result.product && (
            <Button 
              onClick={() => handleViewOnAmazon(result.product!.product_url)}
              className="w-full"
            >
              View on Amazon
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {!result.product && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://www.amazon.com/s?k=${encodeURIComponent(result.recommendation.searchQuery)}`, '_blank')}
            >
              Search on Amazon
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to calculate discount percentage
function calculateDiscount(currentPrice: string | number, originalPrice: string | number): number {
  const current = typeof currentPrice === 'string' ? parseFloat(currentPrice.replace(/[^0-9.]/g, '')) : currentPrice;
  const original = typeof originalPrice === 'string' ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) : originalPrice;
  
  if (isNaN(current) || isNaN(original) || original <= 0) {
    return 0;
  }
  
  const discount = ((original - current) / original) * 100;
  return Math.round(discount);
}
