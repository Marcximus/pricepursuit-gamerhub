
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
import { ProductHighlights } from './components/ProductHighlights';

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
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative">
        <ProductHeader 
          title={productData.title}
          productUrl={productData.productUrl}
          index={index}
        />
        
        <ProductImage 
          imageUrl={productData.imageUrl}
          altText={productData.title}
          fallbackText={result.recommendation.model}
          url={productData.productUrl}
        />
      </div>
      
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="h-16">
          <ProductTitle 
            title={productData.title}
            url={productData.productUrl}
          />
        </div>
        
        <div className="h-10">
          {result.product && (
            <ProductRating 
              rating={productData.rating}
              ratingCount={productData.ratingCount}
              isPrime={productData.isPrime}
              url={productData.productUrl}
            />
          )}
        </div>
        
        <div className="mb-2">
          <ProductPrice 
            currentPrice={productData.currentPrice}
            originalPrice={productData.originalPrice}
            discountPercentage={productData.discountPercentage}
            deliveryInfo={productData.deliveryInfo}
            url={productData.productUrl}
          />
        </div>
        
        <div className="min-h-32 mb-4">
          <ProductHighlights highlights={productData.highlights} />
        </div>
        
        <div className="min-h-36 mb-6">
          <ProductReason reason={productData.reason} />
        </div>
        
        <div className="mt-auto">
          <ProductActions 
            productUrl={result.product?.product_url}
            searchQuery={productData.searchQuery}
          />
        </div>
      </CardContent>
    </Card>
  );
};
