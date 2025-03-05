
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RecommendationResult } from '../types/quizTypes';
import { formatProductData } from './utils/productFormatter';
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
  // Format all product data using the dedicated formatter
  const productData = formatProductData(result, index);

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <ProductHeader 
        title={productData.title}
        productUrl={productData.productUrl}
        index={productData.index}
      />
      
      <ProductImage 
        imageUrl={productData.imageUrl}
        altText={productData.title}
        fallbackText={result.recommendation.model}
        url={productData.productUrl}
      />
      
      <CardContent className="p-6">
        <ProductTitle 
          title={productData.title}
          url={productData.productUrl}
        />
        
        {result.product && (
          <ProductRating 
            rating={productData.rating}
            ratingCount={productData.ratingCount}
            isPrime={productData.isPrime}
            url={productData.productUrl}
          />
        )}
        
        <ProductPrice 
          currentPrice={productData.currentPrice}
          originalPrice={productData.originalPrice}
          discountPercentage={productData.discountPercentage}
          deliveryInfo={productData.deliveryInfo}
          url={productData.productUrl}
        />
        
        <ProductReason reason={productData.reason} />
        
        <ProductActions 
          productUrl={result.product?.product_url}
          searchQuery={productData.searchQuery}
        />
      </CardContent>
    </Card>
  );
};
