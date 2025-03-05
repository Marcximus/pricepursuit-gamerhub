
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RecommendationResult } from '../types/quizTypes';
import { formatPrice, calculateDiscount } from './utils/priceFormatter';
import { getProductUrl } from './utils/urlFormatter';
import { ProductImage } from './components/ProductImage';
import { ProductHeader } from './components/ProductHeader';
import { ProductTitle } from './components/ProductTitle';
import { ProductRating } from './components/ProductRating';
import { ProductPrice } from './components/ProductPrice';
import { ProductReason } from './components/ProductReason';
import { ProductActions } from './components/ProductActions';

interface RecommendationCardProps {
  result: RecommendationResult;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  result,
  index
}) => {
  // Get the appropriate URL for the product or search query
  const productUrl = getProductUrl(
    result.product?.product_url,
    result.recommendation.searchQuery
  );

  // Get formatted prices
  const formattedCurrentPrice = result.product 
    ? formatPrice(result.product.product_price, result.recommendation.priceRange.min, result.recommendation.priceRange.max)
    : `$${result.recommendation.priceRange.min.toLocaleString()} - $${result.recommendation.priceRange.max.toLocaleString()}`;
  
  const formattedOriginalPrice = result.product?.product_original_price 
    ? formatPrice(result.product.product_original_price, 0, 0)
    : undefined;

  // Calculate discount if both prices are available
  const discountPercentage = result.product?.product_original_price
    ? calculateDiscount(result.product.product_price, result.product.product_original_price)
    : undefined;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <ProductHeader 
        title={result.product?.product_title || result.recommendation.model}
        productUrl={productUrl}
        index={index}
      />
      
      <ProductImage 
        imageUrl={result.product?.product_photo}
        altText={result.product?.product_title || result.recommendation.model}
        fallbackText={result.recommendation.model}
        url={productUrl}
      />
      
      <CardContent className="p-6">
        <ProductTitle 
          title={result.product?.product_title || result.recommendation.model}
          url={productUrl}
        />
        
        {result.product && (
          <ProductRating 
            rating={result.product.product_star_rating}
            ratingCount={result.product.product_num_ratings}
            isPrime={result.product.is_prime}
            url={productUrl}
          />
        )}
        
        <ProductPrice 
          currentPrice={formattedCurrentPrice}
          originalPrice={formattedOriginalPrice}
          discountPercentage={discountPercentage}
          deliveryInfo={result.product?.delivery}
          url={productUrl}
        />
        
        <ProductReason reason={result.recommendation.reason} />
        
        <ProductActions 
          productUrl={result.product?.product_url}
          searchQuery={result.recommendation.searchQuery}
        />
      </CardContent>
    </Card>
  );
};
