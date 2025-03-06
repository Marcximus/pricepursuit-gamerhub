
import React from 'react';
import { Card } from '@/components/ui/card';
import { RecommendationResult } from '../types/quizTypes';
import { ProductHeader } from './components/ProductHeader';
import { ProductImage } from './components/ProductImage';
import { ProductPrice } from './components/ProductPrice';
import { ProductRating } from './components/ProductRating';
import { ProductReason } from './components/ProductReason';
import { ProductHighlights } from './components/ProductHighlights';
import { ProductActions } from './components/ProductActions';
import { formatProductData, extractSpecsFromRecommendation } from './utils/productFormatter';
import { LaptopSpecs } from '@/components/laptops/components/LaptopSpecs';

interface RecommendationCardProps {
  result: RecommendationResult;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ result, index }) => {
  const productData = formatProductData(result, index);
  
  // Extract specs from the recommendation
  const specs = extractSpecsFromRecommendation(result);
  
  // Enhance the product with extracted specs if they don't exist
  if (result.product) {
    result.product.processor = result.product.processor || specs.processor;
    result.product.ram = result.product.ram || specs.ram;
    result.product.storage = result.product.storage || specs.storage;
    result.product.graphics = result.product.graphics || specs.graphics;
    result.product.screen_size = result.product.screen_size || specs.screen_size;
    result.product.screen_resolution = result.product.screen_resolution || specs.screen_resolution;
    result.product.weight = result.product.weight || specs.weight;
    result.product.battery_life = result.product.battery_life || specs.battery_life;
  }
  
  return (
    <Card className="overflow-hidden animate-fade-in">
      <div className="p-6 space-y-6">
        <ProductHeader
          title={productData.title}
          productUrl={productData.productUrl}
          index={index}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProductImage
            imageUrl={productData.imageUrl}
            title={productData.title}
            productUrl={productData.productUrl}
          />
          
          <div className="flex flex-col gap-4">
            <ProductPrice
              currentPrice={productData.currentPrice}
              originalPrice={productData.originalPrice}
              discount={productData.discountPercentage}
            />
            
            <ProductRating
              rating={productData.rating}
              ratingCount={productData.ratingCount}
              isPrime={productData.isPrime}
              deliveryInfo={productData.deliveryInfo}
            />
            
            <LaptopSpecs
              title={productData.title}
              productUrl={productData.productUrl}
              specs={{
                processor: specs.processor,
                ram: specs.ram,
                storage: specs.storage,
                graphics: specs.graphics,
                screenSize: specs.screen_size,
                screenResolution: specs.screen_resolution,
                weight: specs.weight
              }}
              brand={result.product?.processor?.split(' ')[0] || 'Unknown'}
              model={result.product?.product_title?.split(' ').slice(1, 3).join(' ') || 'Unknown Model'}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <ProductReason reason={productData.reason} />
          
          <ProductHighlights highlights={productData.highlights} />
          
          <ProductActions
            searchQuery={productData.searchQuery}
            productUrl={productData.productUrl}
            title={productData.title}
          />
        </div>
      </div>
    </Card>
  );
};
