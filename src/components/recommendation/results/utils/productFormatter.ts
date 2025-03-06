
/**
 * Utilities for formatting product data from recommendation results
 */
import { RecommendationResult } from '../../types/quizTypes';
import { formatPrice, calculateDiscount } from './priceFormatter';
import { getProductUrl } from './urlFormatter';
import { Battery, Check, Sparkle, Star, ThumbsUp, Weight, Zap } from 'lucide-react';
import React from 'react';

/**
 * Extract formatted product information from a recommendation result
 */
export interface FormattedProductData {
  title: string;
  imageUrl?: string;
  productUrl: string;
  currentPrice: string;
  originalPrice?: string;
  discountPercentage?: number;
  rating?: number;
  ratingCount?: number;
  isPrime?: boolean;
  deliveryInfo?: string;
  reason: string;
  index: number;
  searchQuery: string;
  highlights: {text: string, icon: React.ReactNode}[];
}

/**
 * Generate highlights based on product and recommendation data
 */
const generateHighlights = (result: RecommendationResult): {text: string, icon: React.ReactNode}[] => {
  const highlights: {text: string, icon: React.ReactNode}[] = [];
  const { recommendation, product } = result;
  
  // Add processor highlight if available
  if (product?.processor) {
    highlights.push({
      text: `Powerful ${product.processor}`,
      icon: React.createElement(Zap, { size: 16 })
    });
  }
  
  // Add RAM highlight if available
  if (product?.ram) {
    highlights.push({
      text: `${product.ram} for smooth multitasking`,
      icon: React.createElement(Check, { size: 16 })
    });
  }
  
  // Add storage highlight if available
  if (product?.storage) {
    highlights.push({
      text: `Ample ${product.storage} storage`,
      icon: React.createElement(Sparkle, { size: 16 })
    });
  }
  
  // Add graphics highlight if available
  if (product?.graphics) {
    highlights.push({
      text: `Great visuals with ${product.graphics}`,
      icon: React.createElement(Star, { size: 16 })
    });
  }
  
  // Add battery life highlight if available
  if (product?.battery_life) {
    highlights.push({
      text: `Long battery life: ${product.battery_life}`,
      icon: React.createElement(Battery, { size: 16 })
    });
  }
  
  // Add weight highlight if available
  if (product?.weight) {
    highlights.push({
      text: `Lightweight at ${product.weight}`,
      icon: React.createElement(Weight, { size: 16 })
    });
  }
  
  // General recommendation highlight
  highlights.push({
    text: `Recommended for ${recommendation.usage || 'your needs'}`,
    icon: React.createElement(ThumbsUp, { size: 16 })
  });
  
  return highlights.slice(0, 4); // Limit to 4 highlights
};

/**
 * Extract and format all product data from a recommendation result
 * @param result The recommendation result containing product and recommendation data
 * @param index The index of the recommendation in the list
 * @returns Formatted product data ready for display
 */
export const formatProductData = (
  result: RecommendationResult,
  index: number
): FormattedProductData => {
  const { recommendation, product } = result;
  
  // Get the appropriate URL for the product or search query
  const productUrl = getProductUrl(
    product?.product_url,
    recommendation.searchQuery
  );

  // Get formatted prices
  const formattedCurrentPrice = product 
    ? formatPrice(product.product_price, recommendation.priceRange.min, recommendation.priceRange.max)
    : `$${recommendation.priceRange.min.toLocaleString()} - $${recommendation.priceRange.max.toLocaleString()}`;
  
  const formattedOriginalPrice = product?.product_original_price 
    ? formatPrice(product.product_original_price, 0, 0)
    : undefined;

  // Calculate discount if both prices are available
  const discountPercentage = product?.product_original_price
    ? calculateDiscount(product.product_price, product.product_original_price)
    : undefined;

  // Generate highlights based on product information
  const highlights = generateHighlights(result);

  return {
    title: product?.product_title || recommendation.model,
    imageUrl: product?.product_photo,
    productUrl,
    currentPrice: formattedCurrentPrice,
    originalPrice: formattedOriginalPrice,
    discountPercentage,
    rating: product?.product_star_rating,
    ratingCount: product?.product_num_ratings,
    isPrime: product?.is_prime,
    deliveryInfo: product?.delivery,
    reason: recommendation.reason,
    index,
    searchQuery: recommendation.searchQuery,
    highlights
  };
};
