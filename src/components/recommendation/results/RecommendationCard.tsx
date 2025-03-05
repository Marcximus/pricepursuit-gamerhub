
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
      return `$${result.recommendation.priceRange.min.toLocaleString()} - $${result.recommendation.priceRange.max.toLocaleString()}`;
    }
    
    if (typeof price === 'number') {
      return `$ ${Math.round(price).toLocaleString()}`;
    }
    
    if (typeof price === 'string') {
      // Extract numeric value and format
      const numericValue = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericValue)) {
        return `$ ${Math.round(numericValue).toLocaleString()}`;
      }
      if (price.startsWith('$')) return `$ ${price.substring(1).trim()}`;
      return `$ ${price}`;
    }
    
    return `$${result.recommendation.priceRange.min.toLocaleString()} - $${result.recommendation.priceRange.max.toLocaleString()}`;
  };

  // Get the appropriate URL for the product or search query
  const getProductUrl = (): string => {
    if (result.product) {
      return result.product.product_url;
    } else {
      return `https://www.amazon.com/s?k=${encodeURIComponent(result.recommendation.searchQuery)}`;
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="relative">
        <div className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-1 rounded-br-md z-10">
          Recommendation {index + 1}
        </div>
        
        {result.product ? (
          <a 
            href={result.product.product_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <div className="h-64 bg-gray-100 flex items-center justify-center p-6 overflow-hidden">
              <img 
                src={result.product.product_photo} 
                alt={result.product.product_title} 
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-110"
              />
            </div>
          </a>
        ) : (
          <a 
            href={`https://www.amazon.com/s?k=${encodeURIComponent(result.recommendation.searchQuery)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <div className="h-64 bg-gray-100 flex items-center justify-center p-6">
              <div className="text-gray-400 text-center">
                <p className="font-semibold mb-2">Image not available</p>
                <p className="text-sm">{result.recommendation.model}</p>
              </div>
            </div>
          </a>
        )}
      </div>
      
      <CardContent className="p-6">
        <a 
          href={getProductUrl()}
          target="_blank" 
          rel="noopener noreferrer" 
          className="block hover:text-blue-700 transition-colors"
        >
          <h2 className="text-xl font-bold mb-2 line-clamp-2">
            {result.product ? result.product.product_title : result.recommendation.model}
          </h2>
        </a>
        
        {result.product && (
          <a 
            href={getProductUrl()}
            target="_blank" 
            rel="noopener noreferrer"
            className="block mb-4"
          >
            <div className="flex items-center">
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
          </a>
        )}
        
        <div className="mb-4">
          <a 
            href={getProductUrl()}
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
          >
            <div className="text-2xl font-bold text-blue-700">
              {result.product ? formatPrice(result.product.product_price) : `$${result.recommendation.priceRange.min.toLocaleString()} - $${result.recommendation.priceRange.max.toLocaleString()}`}
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
          </a>
          
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
