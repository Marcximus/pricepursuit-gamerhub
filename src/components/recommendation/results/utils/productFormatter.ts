/**
 * Utilities for formatting product data from recommendation results
 */
import { RecommendationResult } from '../../types/quizTypes';
import { formatPrice, calculateDiscount } from './priceFormatter';
import { getProductUrl } from './urlFormatter';
import { Battery, Cpu, Gauge, Sparkle, Star, ThumbsUp, Trophy, Weight, Zap } from 'lucide-react';
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
 * Generate spec-focused highlights based on product data
 */
const generateHighlights = (result: RecommendationResult): {text: string, icon: React.ReactNode}[] => {
  const highlightsList: {text: string, icon: React.ReactNode}[] = [];
  const { recommendation, product } = result;
  
  // Add rating-based highlight if ratings are good
  if (product?.product_star_rating && product.product_star_rating >= 4.5) {
    highlightsList.push({
      text: `Outstanding ${product.product_star_rating}★ rating from ${product?.product_num_ratings?.toLocaleString() || 'many'} users`,
      icon: React.createElement(Star, { size: 16 })
    });
  } else if (product?.product_star_rating && product.product_star_rating >= 4) {
    highlightsList.push({
      text: `Excellent ${product.product_star_rating}★ rating from ${product?.product_num_ratings?.toLocaleString() || 'users'}`,
      icon: React.createElement(Star, { size: 16 })
    });
  }
  
  // Add graphics highlight for gaming laptops
  if (product?.graphics) {
    const isHighEndNvidia = product.graphics.match(/RTX\s*(30|40)\d+/i);
    const isAmdHighEnd = product.graphics.match(/Radeon\s*(RX\s*)?6\d{3}/i);
    const isAppleSilicon = product.graphics.match(/M[123](\s*(Pro|Max|Ultra))?/i);
    
    if (isHighEndNvidia) {
      highlightsList.push({
        text: `Powerful ${product.graphics} for exceptional gaming performance`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (isAmdHighEnd) {
      highlightsList.push({
        text: `High-end ${product.graphics} delivers impressive gaming visuals`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (isAppleSilicon) {
      highlightsList.push({
        text: `Fast ${product.graphics} GPU for smooth creative workflows`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (product.graphics.match(/RTX|GTX|Radeon/i)) {
      highlightsList.push({
        text: `Dedicated ${product.graphics} for gaming and creative work`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    }
  }
  
  // Add processor highlight with more detail
  if (product?.processor) {
    const isIntelHighEnd = product.processor.match(/i7|i9|Core Ultra/i);
    const isAmdHighEnd = product.processor.match(/Ryzen\s+[79]/i);
    const isAppleM = product.processor.match(/M[123](\s*(Pro|Max|Ultra))?/i);
    
    if (isIntelHighEnd) {
      highlightsList.push({
        text: `High-performance ${product.processor} processor for demanding tasks`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    } else if (isAmdHighEnd) {
      highlightsList.push({
        text: `Powerful ${product.processor} CPU with excellent multi-core performance`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    } else if (isAppleM) {
      highlightsList.push({
        text: `Cutting-edge ${product.processor} chip with incredible efficiency`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    }
  }
  
  // Add RAM highlight for high-memory configurations
  if (product?.ram && product.ram.match(/(16|32|64|128)\s*GB/i)) {
    const ramSize = parseInt(product.ram.match(/(\d+)/)?.[1] || '0');
    
    if (ramSize >= 32) {
      highlightsList.push({
        text: `Massive ${product.ram} memory for extreme multitasking`,
        icon: React.createElement(Zap, { size: 16 })
      });
    } else if (ramSize >= 16) {
      highlightsList.push({
        text: `Generous ${product.ram} RAM for smooth multitasking`,
        icon: React.createElement(Zap, { size: 16 })
      });
    }
  }
  
  // Add storage highlight for large SSDs
  if (product?.storage && product.storage.match(/SSD|NVMe/i)) {
    const storageSize = product.storage.match(/(\d+)\s*TB/i) 
      ? parseInt(product.storage.match(/(\d+)\s*TB/i)?.[1] || '0') * 1000 
      : parseInt(product.storage.match(/(\d+)\s*GB/i)?.[1] || '0');
    
    if (storageSize >= 1000) {
      highlightsList.push({
        text: `Spacious ${product.storage} for all your files and games`,
        icon: React.createElement(Trophy, { size: 16 })
      });
    } else if (storageSize >= 500) {
      highlightsList.push({
        text: `Fast ${product.storage} loads programs in seconds`,
        icon: React.createElement(Trophy, { size: 16 })
      });
    }
  }
  
  // Add weight highlight for ultraportable laptops
  if (product?.weight) {
    const weightValue = parseFloat(product.weight.replace(/[^\d.]/g, '.'));
    
    if (weightValue < 1.5) {
      highlightsList.push({
        text: `Ultra-lightweight at just ${product.weight} - perfect for travel`,
        icon: React.createElement(Weight, { size: 16 })
      });
    } else if (weightValue < 2) {
      highlightsList.push({
        text: `Highly portable ${product.weight} design for on-the-go use`,
        icon: React.createElement(Weight, { size: 16 })
      });
    }
  }
  
  // Add battery life highlight if it's impressive
  if (product?.battery_life) {
    const batteryHours = parseInt(product.battery_life.replace(/[^\d]/g, ''));
    
    if (batteryHours >= 12) {
      highlightsList.push({
        text: `Exceptional ${product.battery_life} battery life for all-day use`,
        icon: React.createElement(Battery, { size: 16 })
      });
    } else if (batteryHours >= 8) {
      highlightsList.push({
        text: `Long-lasting ${product.battery_life} battery keeps you productive`,
        icon: React.createElement(Battery, { size: 16 })
      });
    }
  }

  // Add price-related highlight if there's a good discount
  if (product?.product_original_price && product.product_price) {
    const discount = calculateDiscount(product.product_price, product.product_original_price);
    if (discount >= 20) {
      highlightsList.push({
        text: `Exceptional value with a massive ${discount}% discount`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (discount >= 10) {
      highlightsList.push({
        text: `Great deal with current ${discount}% savings`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    }
  }
  
  // Return the top 3 most impressive highlights, or fallback to generic ones if needed
  if (highlightsList.length === 0) {
    // Only add generic highlights if we couldn't generate specific ones
    highlightsList.push({
      text: `Ideal choice for ${recommendation.usage?.toLowerCase() || 'your specific needs'}`,
      icon: React.createElement(ThumbsUp, { size: 16 })
    });
    
    highlightsList.push({
      text: `Optimized performance for ${recommendation.usage?.toLowerCase() || 'everyday tasks'}`,
      icon: React.createElement(Gauge, { size: 16 })
    });
  }
  
  return highlightsList.slice(0, 3); // Limit to 3 highlights
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
