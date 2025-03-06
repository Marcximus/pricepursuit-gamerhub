
/**
 * Utilities for formatting product data from recommendation results
 */
import { RecommendationResult } from '../../types/quizTypes';
import { formatPrice, calculateDiscount } from './priceFormatter';
import { getProductUrl } from './urlFormatter';
import React from 'react';
import { Check, Sparkle, Star } from 'lucide-react';

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

  // Map DeepSeek highlights to the format expected by the component
  // Assign appropriate icons based on content
  const defaultIcons = [
    React.createElement(Star, { className: "h-4 w-4", key: "star" }),
    React.createElement(Check, { className: "h-4 w-4", key: "check" }),
    React.createElement(Sparkle, { className: "h-4 w-4", key: "sparkle" })
  ];
  
  const formattedHighlights = (recommendation.highlights || []).map((text, index) => {
    let icon = defaultIcons[index % defaultIcons.length];
    
    // Assign more appropriate icons based on highlight content
    if (text.toLowerCase().includes('rating') || text.toLowerCase().includes('★') || text.toLowerCase().includes('star')) {
      icon = React.createElement(Star, { className: "h-4 w-4" });
    } else if (text.toLowerCase().includes('processor') || text.toLowerCase().includes('cpu') || text.toLowerCase().includes('performance')) {
      icon = React.createElement(Sparkle, { className: "h-4 w-4" });
    }
    
    return {
      text,
      icon
    };
  });

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
    highlights: formattedHighlights
  };
};
