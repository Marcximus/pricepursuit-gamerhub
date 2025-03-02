
/**
 * Core functionality for processing laptop data
 */
import { processTitle } from './titleProcessor';
import { processProcessor, processRam, processStorage, processScreenResolution, 
         processRefreshRate, processTouchscreen, processOperatingSystem, 
         processColor, processWarranty, processOfficeIncluded,
         processBacklitKeyboard, processPorts, processFingerprint } from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { processScreenSize, processWeight, processBatteryLife, processCamera } from './physicalSpecsProcessor';
import { processLaptopDescription, generateLaptopScore } from './descriptionProcessor';
import { normalizeBrand } from '@/utils/laptop/normalizers/brandNormalizer';
import { normalizeModel } from '@/utils/laptop/normalizers/modelNormalizer';
import type { Product } from "@/types/product";
import { LaptopSpecs } from './types';

/**
 * Process and create the laptop product object with improved specification extraction
 */
export const processLaptopData = (laptop: any): Product => {
  console.log('Processing laptop data:', {
    id: laptop.id,
    asin: laptop.asin,
    title: laptop.title,
    rating: laptop.rating,
    averageRating: laptop.average_rating,
    totalReviews: laptop.total_reviews,
    hasReviews: laptop.product_reviews?.length > 0,
    reviewData: laptop.review_data,
    storedBrand: laptop.brand
  });
  
  // Process prices
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

  // Process review data
  let review_data: any = laptop.review_data || {
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

  // Ensure the review_data object has the expected structure
  if (!review_data.rating_breakdown) {
    review_data.rating_breakdown = {};
  }
  if (!review_data.recent_reviews) {
    review_data.recent_reviews = [];
  }

  const rating = laptop.rating || laptop.average_rating || null;
  const total_reviews = laptop.total_reviews || review_data.recent_reviews.length || laptop.rating_count || null;

  // Detect the correct brand from title and stored brand
  const detectedBrand = normalizeBrand(laptop.brand || '', laptop.title);
  
  // Extract model from title if not provided
  const detectedModel = normalizeModel(laptop.model || '', laptop.title || '', detectedBrand);

  // Extract primary specifications from title and any existing stored data
  const processedTitle = processTitle(laptop.title || '');
  
  // Create initial specs object with all required properties initialized
  const specs: LaptopSpecs = {
    processor: processProcessor(laptop.processor, processedTitle, laptop.description),
    processor_score: laptop.processor_score || null,
    ram: processRam(laptop.ram, processedTitle, laptop.description),
    storage: processStorage(laptop.storage, processedTitle, laptop.description),
    screen_size: processScreenSize(laptop.screen_size, processedTitle, laptop.description),
    screen_resolution: processScreenResolution(laptop.screen_resolution, processedTitle, laptop.description),
    graphics: processGraphics(laptop.graphics, processedTitle + ' ' + (laptop.description || '')),
    weight: processWeight(laptop.weight, processedTitle, laptop.description),
    battery_life: processBatteryLife(laptop.battery_life, processedTitle, laptop.description),
    camera: processCamera(laptop.camera, processedTitle, laptop.description),
    color: processColor(processedTitle, laptop.description),
    touchscreen: processTouchscreen(processedTitle, laptop.description),
    backlit_keyboard: processBacklitKeyboard(processedTitle, laptop.description),
    fingerprint: processFingerprint(processedTitle, laptop.description),
    ports: processPorts(processedTitle, laptop.description),
    refresh_rate: processRefreshRate(processedTitle, laptop.description),
    operating_system: processOperatingSystem(processedTitle, laptop.description),
    warranty: processWarranty(processedTitle, laptop.description),
    office_included: processOfficeIncluded(processedTitle, laptop.description),
    benchmark_score: null
  };
  
  // Enhance with additional specs from description if available
  if (laptop.description) {
    const enhancedSpecs = processLaptopDescription(laptop.description, processedTitle, specs);
    // Merge the enhanced specs with our existing specs
    Object.assign(specs, enhancedSpecs);
  }
  
  // Calculate a benchmark score if not already provided
  if (!laptop.benchmark_score && Object.values(specs).some(value => value !== null && value !== undefined)) {
    specs.benchmark_score = generateLaptopScore(specs);
  }
  
  // Convert the ports from Record<string, number> to string for compatibility with Product type
  const portsString = specs.ports ? JSON.stringify(specs.ports) : null;
  
  // Process and create the laptop product object
  return {
    id: laptop.id,
    asin: laptop.asin,
    title: processedTitle,
    current_price: current_price,
    original_price: original_price,
    rating: rating,
    rating_count: total_reviews,
    image_url: laptop.image_url || null,
    product_url: laptop.product_url || null,
    last_checked: laptop.last_checked || null,
    created_at: laptop.created_at || null,
    processor: specs.processor,
    processor_score: specs.processor_score,
    ram: specs.ram,
    storage: specs.storage,
    screen_size: specs.screen_size,
    screen_resolution: specs.screen_resolution,
    graphics: specs.graphics,
    benchmark_score: laptop.benchmark_score || specs.benchmark_score || null,
    weight: specs.weight,
    battery_life: specs.battery_life,
    brand: detectedBrand,
    model: detectedModel,
    total_reviews: total_reviews,
    average_rating: rating,
    review_data: {
      // Fix type issues: ensure the review_data structure matches what's expected in Product type
      rating_breakdown: review_data.rating_breakdown || {},
      recent_reviews: Array.isArray(review_data.recent_reviews) 
        ? review_data.recent_reviews 
        : []
    },
    update_status: laptop.update_status || 'pending',
    collection_status: laptop.collection_status || 'pending',
    wilson_score: laptop.wilson_score || null
  };
};
