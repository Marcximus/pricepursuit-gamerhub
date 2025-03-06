
/**
 * Utilities for generating product highlights based on specification data
 */
import React from 'react';
import { Battery, Cpu, Gauge, Sparkle, Star, ThumbsUp, Trophy, Weight, Zap } from 'lucide-react';
import { RecommendationResult } from '../../types/quizTypes';

/**
 * Generate spec-focused highlights based on product data
 */
export const generateHighlights = (result: RecommendationResult): {text: string, icon: React.ReactNode}[] => {
  const highlightsList: {text: string, icon: React.ReactNode}[] = [];
  const { recommendation, product } = result;
  
  // Add rating-based highlight if ratings are good
  if (product?.product_star_rating && product.product_star_rating >= 4.5) {
    highlightsList.push({
      text: `${product.product_star_rating}★ from ${product?.product_num_ratings?.toLocaleString() || 'many'} users`,
      icon: React.createElement(Star, { size: 16 })
    });
  } else if (product?.product_star_rating && product.product_star_rating >= 4) {
    highlightsList.push({
      text: `${product.product_star_rating}★ from ${product?.product_num_ratings?.toLocaleString() || 'users'}`,
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
        text: `Powerful ${product.graphics}`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (isAmdHighEnd) {
      highlightsList.push({
        text: `High-end ${product.graphics}`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (isAppleSilicon) {
      highlightsList.push({
        text: `Fast ${product.graphics} GPU`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (product.graphics.match(/RTX|GTX|Radeon/i)) {
      highlightsList.push({
        text: `Dedicated ${product.graphics}`,
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
        text: `High-performance ${product.processor}`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    } else if (isAmdHighEnd) {
      highlightsList.push({
        text: `Powerful ${product.processor} CPU`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    } else if (isAppleM) {
      highlightsList.push({
        text: `Cutting-edge ${product.processor}`,
        icon: React.createElement(Cpu, { size: 16 })
      });
    }
  }
  
  // Add RAM highlight for high-memory configurations
  if (product?.ram && product.ram.match(/(16|32|64|128)\s*GB/i)) {
    const ramSize = parseInt(product.ram.match(/(\d+)/)?.[1] || '0');
    
    if (ramSize >= 32) {
      highlightsList.push({
        text: `Massive ${product.ram} memory`,
        icon: React.createElement(Zap, { size: 16 })
      });
    } else if (ramSize >= 16) {
      highlightsList.push({
        text: `Generous ${product.ram} RAM`,
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
        text: `Spacious ${product.storage}`,
        icon: React.createElement(Trophy, { size: 16 })
      });
    } else if (storageSize >= 500) {
      highlightsList.push({
        text: `Fast ${product.storage}`,
        icon: React.createElement(Trophy, { size: 16 })
      });
    }
  }
  
  // Add weight highlight for ultraportable laptops
  if (product?.weight) {
    const weightValue = parseFloat(product.weight.replace(/[^\d.]/g, '.'));
    
    if (weightValue < 1.5) {
      highlightsList.push({
        text: `Ultra-lightweight ${product.weight}`,
        icon: React.createElement(Weight, { size: 16 })
      });
    } else if (weightValue < 2) {
      highlightsList.push({
        text: `Highly portable ${product.weight}`,
        icon: React.createElement(Weight, { size: 16 })
      });
    }
  }
  
  // Add battery life highlight if it's impressive
  if (product?.battery_life) {
    const batteryHours = parseInt(product.battery_life.replace(/[^\d]/g, ''));
    
    if (batteryHours >= 12) {
      highlightsList.push({
        text: `${product.battery_life} battery life`,
        icon: React.createElement(Battery, { size: 16 })
      });
    } else if (batteryHours >= 8) {
      highlightsList.push({
        text: `Long ${product.battery_life} battery`,
        icon: React.createElement(Battery, { size: 16 })
      });
    }
  }

  // Add price-related highlight if there's a good discount
  if (product?.product_original_price && product.product_price) {
    const discount = calculateDiscount(product.product_price, product.product_original_price);
    if (discount >= 20) {
      highlightsList.push({
        text: `Massive ${discount}% discount`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    } else if (discount >= 10) {
      highlightsList.push({
        text: `${discount}% savings`,
        icon: React.createElement(Sparkle, { size: 16 })
      });
    }
  }
  
  // If we have fewer than 3 highlights, add generic ones
  const useCaseHighlights = [
    {
      text: `Ideal for ${recommendation.usage?.toLowerCase() || 'your needs'}`,
      icon: React.createElement(ThumbsUp, { size: 16 })
    },
    {
      text: `Optimized for ${recommendation.usage?.toLowerCase() || 'daily tasks'}`,
      icon: React.createElement(Gauge, { size: 16 })
    },
    {
      text: `Perfect for ${recommendation.usage?.toLowerCase() || 'everyday use'}`,
      icon: React.createElement(Star, { size: 16 })
    }
  ];
  
  // Add generic highlights if needed to reach 3
  let index = 0;
  while (highlightsList.length < 3 && index < useCaseHighlights.length) {
    highlightsList.push(useCaseHighlights[index]);
    index++;
  }
  
  // If we have more than 3 highlights, take the first 3
  return highlightsList.slice(0, 3);
};

// Import the calculateDiscount function as it's used in this file
import { calculateDiscount } from './priceFormatter';
