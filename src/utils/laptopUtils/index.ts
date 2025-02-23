
import { processTitle } from './titleProcessor';
import { processProcessor, processRam, processStorage } from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { processScreenSize, processWeight, processBatteryLife } from './physicalSpecsProcessor';
import type { Product } from "@/types/product";

export const processLaptopData = (laptop: any): Product => {
  console.log('Processing laptop data:', {
    id: laptop.id,
    asin: laptop.asin, // Log ASIN for debugging
    title: laptop.title,
    rating: laptop.rating,
    averageRating: laptop.average_rating,
    totalReviews: laptop.total_reviews,
    hasReviews: laptop.product_reviews?.length > 0,
    reviewData: laptop.review_data
  });
  
  let current_price = null;
  let original_price = null;

  if (laptop.current_price !== null && laptop.current_price !== undefined) {
    const parsedPrice = parseFloat(laptop.current_price);
    if (!isNaN(parsedPrice)) {
      current_price = parsedPrice;
    }
  }

  if (laptop.original_price !== null && laptop.original_price !== undefined) {
    const parsedPrice = parseFloat(laptop.original_price);
    if (!isNaN(parsedPrice)) {
      original_price = parsedPrice;
    }
  }

  let review_data = laptop.review_data || {
    rating_breakdown: {},
    recent_reviews: []
  };

  if (typeof review_data === 'string') {
    try {
      review_data = JSON.parse(review_data);
    } catch (error) {
      console.error('Error parsing review data:', error);
    }
  }

  if (!review_data.rating_breakdown) {
    review_data.rating_breakdown = {};
  }
  if (!review_data.recent_reviews) {
    review_data.recent_reviews = [];
  }

  const rating = laptop.rating || laptop.average_rating || null;
  const total_reviews = laptop.total_reviews || review_data.recent_reviews.length || laptop.rating_count || null;

  console.log('Processed rating data:', {
    id: laptop.id,
    asin: laptop.asin, // Log ASIN in processed data
    rating,
    totalReviews: total_reviews,
    reviewCount: review_data.recent_reviews?.length,
    hasRatingBreakdown: !!review_data.rating_breakdown
  });

  const brand = laptop.brand?.trim() || 'Unknown';

  return {
    id: laptop.id,
    asin: laptop.asin,
    title: processTitle(laptop.title || ''),
    current_price: current_price,
    original_price: original_price,
    rating: rating,
    rating_count: total_reviews,
    image_url: laptop.image_url || null,
    product_url: laptop.product_url || null,
    last_checked: laptop.last_checked || null,
    created_at: laptop.created_at || null,
    processor: processProcessor(laptop.processor, laptop.title || ''),
    processor_score: laptop.processor_score || null,
    ram: processRam(laptop.ram, laptop.title || ''),
    storage: processStorage(laptop.storage, laptop.title || ''),
    screen_size: processScreenSize(laptop.screen_size, laptop.title || ''),
    screen_resolution: laptop.screen_resolution || null,
    graphics: processGraphics(laptop.graphics, laptop.title || ''),
    benchmark_score: laptop.benchmark_score || null,
    weight: processWeight(laptop.weight, laptop.title || ''),
    battery_life: processBatteryLife(laptop.battery_life, laptop.title || ''),
    brand: brand,
    total_reviews: total_reviews,
    average_rating: rating,
    review_data: review_data
  };
};

export * from './titleProcessor';
export * from './specsProcessor';
export * from './graphicsProcessor';
export * from './physicalSpecsProcessor';
