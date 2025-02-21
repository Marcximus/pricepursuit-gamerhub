
import { processTitle } from './titleProcessor';
import { processProcessor, processRam, processStorage } from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { processScreenSize, processWeight, processBatteryLife } from './physicalSpecsProcessor';
import type { Product } from "@/types/product";

export const processLaptopData = (laptop: any): Product => {
  console.log('Processing laptop data:', {
    id: laptop.id,
    title: laptop.title,
    rawPrice: laptop.current_price,
    rawOriginalPrice: laptop.original_price
  });
  
  // Parse review_data if it exists and is a string
  let parsedReviewData = laptop.review_data;
  if (typeof laptop.review_data === 'string') {
    try {
      parsedReviewData = JSON.parse(laptop.review_data);
    } catch (error) {
      console.error('Error parsing review data:', error);
      parsedReviewData = undefined;
    }
  }

  // Calculate average rating and total reviews from review data if not available directly
  let avgRating = laptop.average_rating;
  let totalReviews = laptop.total_reviews;
  
  if ((!avgRating || !totalReviews) && parsedReviewData?.rating_breakdown) {
    const ratings = Object.entries(parsedReviewData.rating_breakdown)
      .map(([rating, count]) => ({
        rating: parseInt(rating),
        count: typeof count === 'number' ? count : 0
      }));
    
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, { count }) => sum + count, 0);
      const weightedSum = ratings.reduce((sum, { rating, count }) => sum + (rating * count), 0);
      
      totalReviews = total;
      avgRating = total > 0 ? weightedSum / total : null;
    }
  }

  // Ensure current_price and original_price are properly handled as numbers
  const current_price = typeof laptop.current_price === 'number' ? laptop.current_price :
                       typeof laptop.current_price === 'string' ? parseFloat(laptop.current_price) : null;
                       
  const original_price = typeof laptop.original_price === 'number' ? laptop.original_price :
                        typeof laptop.original_price === 'string' ? parseFloat(laptop.original_price) : null;

  console.log('Processed price data:', {
    id: laptop.id,
    processedCurrentPrice: current_price,
    processedOriginalPrice: original_price,
    priceType: typeof current_price
  });

  const processed = {
    id: laptop.id,
    asin: laptop.asin,
    title: processTitle(laptop.title || ''),
    current_price: current_price,
    original_price: original_price,
    rating: laptop.rating || avgRating || null,
    rating_count: laptop.rating_count || null,
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
    total_reviews: totalReviews || null,
    average_rating: avgRating || null,
    review_data: parsedReviewData || null
  };

  return processed;
};

export * from './titleProcessor';
export * from './specsProcessor';
export * from './graphicsProcessor';
export * from './physicalSpecsProcessor';

