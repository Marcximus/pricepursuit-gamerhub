
/**
 * Utilities for formatting product data from recommendation results
 */
import { RecommendationResult } from '../../types/quizTypes';
import { formatPrice, calculateDiscount } from './priceFormatter';
import { getProductUrl } from './urlFormatter';
import React from 'react';
import { Check, Cpu, HardDrive, MonitorSmartphone, Sparkle, Star } from 'lucide-react';

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
 * Format a technical spec into a user-friendly highlight
 */
const enrichHighlight = (highlight: string): string => {
  // Screen size highlight enhancements
  if (highlight.toLowerCase().includes('inch') || highlight.toLowerCase().includes('display')) {
    if (highlight.includes('WQXGA') || highlight.includes('2560')) {
      return `Crisp, high-resolution ${highlight} - perfect for detailed work`;
    }
    if (highlight.includes('4K') || highlight.includes('UHD')) {
      return `Ultra-sharp ${highlight} - incredible for creative professionals`;
    }
    if (highlight.includes('FHD') || highlight.includes('1080p')) {
      return `Clear, vibrant ${highlight} - great for everyday tasks`;
    }
    return `Spacious ${highlight} - excellent for multitasking`;
  }
  
  // Graphics card highlight enhancements
  if (highlight.toLowerCase().includes('gpu') || highlight.toLowerCase().includes('graphics') || 
      highlight.toLowerCase().includes('rtx') || highlight.toLowerCase().includes('gtx')) {
    if (highlight.includes('RTX')) {
      return `Powerful ${highlight} - excellent for gaming and AI workloads`;
    }
    if (highlight.includes('GTX')) {
      return `Capable ${highlight} - great for gaming and creative apps`;
    }
    if (highlight.includes('Iris') || highlight.includes('integrated')) {
      return `${highlight} - good for everyday tasks and light creative work`;
    }
    return `${highlight} - enhances performance for graphics-intensive tasks`;
  }
  
  // Storage highlight enhancements
  if (highlight.toLowerCase().includes('ssd') || highlight.toLowerCase().includes('storage')) {
    if (highlight.includes('TB') || highlight.includes('1000')) {
      return `Generous ${highlight} - plenty of space for large files and projects`;
    }
    if (highlight.includes('NVMe') || highlight.includes('PCIe')) {
      return `Ultra-fast ${highlight} - lightning-quick app loading and file transfers`;
    }
    return `${highlight} - quick access to your files and programs`;
  }
  
  // RAM highlight enhancements
  if (highlight.toLowerCase().includes('ram') || highlight.toLowerCase().includes('memory')) {
    if (highlight.includes('32')) {
      return `${highlight} - exceptional for heavy multitasking and complex projects`;
    }
    if (highlight.includes('16')) {
      return `${highlight} - great for running multiple apps simultaneously`;
    }
    return `${highlight} - smooth performance for everyday computing`;
  }
  
  // Processor highlight enhancements
  if (highlight.toLowerCase().includes('processor') || highlight.toLowerCase().includes('cpu') || 
      highlight.toLowerCase().includes('core') || highlight.toLowerCase().includes('ryzen')) {
    if (highlight.includes('i9') || highlight.includes('Ryzen 9')) {
      return `Blazing-fast ${highlight} - top-tier performance for demanding tasks`;
    }
    if (highlight.includes('i7') || highlight.includes('Ryzen 7')) {
      return `Powerful ${highlight} - excellent for professional workloads`;
    }
    return `${highlight} - reliable performance for your computing needs`;
  }
  
  // Battery highlight enhancements
  if (highlight.toLowerCase().includes('battery') || highlight.toLowerCase().includes('hour')) {
    return `${highlight} - freedom to work unplugged all day`;
  }
  
  // Weight highlight enhancements
  if (highlight.toLowerCase().includes('weight') || highlight.toLowerCase().includes('light') || 
      highlight.toLowerCase().includes('thin')) {
    return `${highlight} - easy to carry wherever you go`;
  }
  
  // For any other type of highlight, just return as is
  return highlight;
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

  // Get appropriate icons based on highlight content
  const getIconForHighlight = (highlight: string) => {
    const lowerText = highlight.toLowerCase();
    if (lowerText.includes('display') || lowerText.includes('screen') || lowerText.includes('inch')) {
      return React.createElement(MonitorSmartphone, { className: "h-4 w-4" });
    }
    if (lowerText.includes('gpu') || lowerText.includes('graphics') || lowerText.includes('rtx') || lowerText.includes('gtx')) {
      return React.createElement(Sparkle, { className: "h-4 w-4" });
    }
    if (lowerText.includes('processor') || lowerText.includes('cpu') || lowerText.includes('core')) {
      return React.createElement(Cpu, { className: "h-4 w-4" });
    }
    if (lowerText.includes('ssd') || lowerText.includes('storage')) {
      return React.createElement(HardDrive, { className: "h-4 w-4" });
    }
    if (lowerText.includes('rating') || lowerText.includes('review')) {
      return React.createElement(Star, { className: "h-4 w-4" });
    }
    // Default icon
    return React.createElement(Check, { className: "h-4 w-4" });
  };
  
  // Map DeepSeek highlights to the format expected by the component
  // and enrich them with more descriptive content
  const formattedHighlights = (recommendation.highlights || []).map((text) => {
    const enrichedText = enrichHighlight(text);
    return {
      text: enrichedText,
      icon: getIconForHighlight(text)
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
