/**
 * Utilities for formatting product data from recommendation results
 */
import { RecommendationResult } from '../../types/quizTypes';
import { formatPrice, calculateDiscount } from './priceFormatter';
import { getProductUrl } from './urlFormatter';
import { Battery, Cpu, Gauge, Sparkle, Star, ThumbsUp, Weight, Zap } from 'lucide-react';
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
 * Generate enthusiastic highlights based on product and recommendation data
 */
const generateHighlights = (result: RecommendationResult): {text: string, icon: React.ReactNode}[] => {
  const highlights: {text: string, icon: React.ReactNode}[] = [];
  const { recommendation, product } = result;
  
  // Add processor highlight if available with enthusiastic language
  if (product?.processor) {
    const isHighEnd = product.processor.match(/i9|i7|ryzen 9|ryzen 7|m3|m2 pro|m2 max|core ultra/i);
    const isMidRange = product.processor.match(/i5|ryzen 5/i);
    
    if (isHighEnd) {
      highlights.push({
        text: `Exceptional performance with the powerful ${product.processor} processor`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    } else if (isMidRange) {
      highlights.push({
        text: `Great balance of power and efficiency with the ${product.processor}`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    } else {
      highlights.push({
        text: `Reliable performance from the ${product.processor} processor`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    }
  }
  
  // Add RAM highlight if available with more enthusiasm
  if (product?.ram) {
    const ramSize = parseInt(product.ram.replace(/\D/g, ''));
    
    if (ramSize >= 32) {
      highlights.push({
        text: `Incredible multitasking with massive ${product.ram} memory`,
        icon: React.createElement(Zap, { size: 16 })
      });
    } else if (ramSize >= 16) {
      highlights.push({
        text: `Smooth multitasking with ample ${product.ram} high-speed memory`,
        icon: React.createElement(Zap, { size: 16 })
      });
    } else {
      highlights.push({
        text: `Capable ${product.ram} memory for everyday tasks`,
        icon: React.createElement(Zap, { size: 16 })
      });
    }
  }
  
  // Add storage highlight if available with enthusiasm
  if (product?.storage) {
    const storageSize = parseInt(product.storage.replace(/\D/g, ''));
    const hasSSD = product.storage.match(/SSD|NVMe/i);
    
    if (storageSize >= 1000 && hasSSD) {
      highlights.push({
        text: `Massive ${product.storage} lightning-fast storage for all your files`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (hasSSD) {
      highlights.push({
        text: `Fast ${product.storage} SSD for quick boot times and responsive apps`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else {
      highlights.push({
        text: `Spacious ${product.storage} to store all your important files`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    }
  }
  
  // Add graphics highlight if available with enthusiasm
  if (product?.graphics) {
    const isHighEnd = product.graphics.match(/RTX|GTX|RX|Radeon Pro|M3|M2/i);
    
    if (isHighEnd) {
      highlights.push({
        text: `Amazing visuals with the powerful ${product.graphics} graphics`,
        icon: React.createElement(Star, { size: 16 })
      });
    } else {
      highlights.push({
        text: `Solid graphics performance with ${product.graphics}`,
        icon: React.createElement(Star, { size: 16 })
      });
    }
  }
  
  // Add screen size highlight if available
  if (product?.screen_size) {
    const screenSize = parseFloat(product.screen_size);
    let screenDescription = "Compact";
    
    if (screenSize >= 16) {
      screenDescription = "Expansive";
    } else if (screenSize >= 14) {
      screenDescription = "Perfect-sized";
    }
    
    highlights.push({
      text: `${screenDescription} ${product.screen_size} display for ${screenSize >= 15 ? 'immersive' : 'comfortable'} viewing`,
      icon: React.createElement(Star, { size: 16 })
    });
  }
  
  // Add battery life highlight if available
  if (product?.battery_life) {
    const batteryHours = parseInt(product.battery_life.replace(/\D/g, ''));
    
    if (batteryHours >= 10) {
      highlights.push({
        text: `Outstanding ${product.battery_life} battery life for all-day productivity`,
        icon: React.createElement(Battery, { size: 16 })
      });
    } else if (batteryHours >= 6) {
      highlights.push({
        text: `Solid ${product.battery_life} battery life for on-the-go use`,
        icon: React.createElement(Battery, { size: 16 })
      });
    } else {
      highlights.push({
        text: `${product.battery_life} battery life for your daily tasks`,
        icon: React.createElement(Battery, { size: 16 })
      });
    }
  }
  
  // Add weight highlight if available
  if (product?.weight) {
    const weightValue = parseFloat(product.weight.replace(/\D/g, '.'));
    
    if (weightValue < 1.5) {
      highlights.push({
        text: `Ultra-lightweight design at just ${product.weight} - perfect for travel`,
        icon: React.createElement(Weight, { size: 16 })
      });
    } else if (weightValue < 2) {
      highlights.push({
        text: `Highly portable at only ${product.weight}`,
        icon: React.createElement(Weight, { size: 16 })
      });
    } else {
      highlights.push({
        text: `Well-built design weighing ${product.weight}`,
        icon: React.createElement(Weight, { size: 16 })
      });
    }
  }
  
  // General recommendation highlight with better wording
  highlights.push({
    text: `Ideal choice for ${recommendation.usage?.toLowerCase() || 'your specific needs'}`,
    icon: React.createElement(ThumbsUp, { size: 16 })
  });
  
  // Add performance highlight focused on usage
  highlights.push({
    text: `Optimized performance for ${recommendation.usage?.toLowerCase() || 'everyday tasks'}`,
    icon: React.createElement(Gauge, { size: 16 })
  });
  
  // Price-related highlight if there's a discount
  if (product?.product_original_price && product.product_original_price > product.product_price) {
    const discount = calculateDiscount(product.product_price, product.product_original_price);
    if (discount > 10) {
      highlights.push({
        text: `Amazing value with a ${discount}% discount right now!`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    }
  }
  
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
