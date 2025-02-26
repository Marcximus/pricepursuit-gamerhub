
import { processTitle } from './titleProcessor';
import { processProcessor, processRam, processStorage } from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { processScreenSize, processWeight, processBatteryLife } from './physicalSpecsProcessor';
import type { Product } from "@/types/product";

// Known laptop brands with proper capitalization
const BRAND_CORRECTIONS: {[key: string]: string} = {
  'apple': 'Apple',
  'lenovo': 'Lenovo',
  'hp': 'HP',
  'dell': 'Dell',
  'asus': 'ASUS',
  'acer': 'Acer',
  'msi': 'MSI',
  'samsung': 'Samsung',
  'microsoft': 'Microsoft',
  'lg': 'LG',
  'razer': 'Razer',
  'toshiba': 'Toshiba',
  'gigabyte': 'Gigabyte',
  'huawei': 'Huawei',
  'xiaomi': 'Xiaomi',
  'alienware': 'Alienware'
};

// Brand identification patterns
const BRAND_PATTERNS: {[key: string]: RegExp[]} = {
  'Apple': [/\bmacbook\b/i, /\bipad\b/i, /\bmac\b/i, /\bapple\b/i, /\bm1\b/i, /\bm2\b/i, /\bm3\b/i],
  'Lenovo': [/\blenovo\b/i, /\bthinkpad\b/i, /\bideapad\b/i, /\byoga\b/i, /\blegion\b/i],
  'HP': [/\bhp\b/i, /\bspectre\b/i, /\bpavilion\b/i, /\benvy\b/i, /\bomen\b/i],
  'Dell': [/\bdell\b/i, /\bxps\b/i, /\binspiron\b/i, /\blatitude\b/i, /\bprecision\b/i],
  'ASUS': [/\basus\b/i, /\bzenbook\b/i, /\brog\b/i, /\btuf\b/i, /\bvivobook\b/i],
  'Acer': [/\bacer\b/i, /\baspire\b/i, /\bpredator\b/i, /\bnitro\b/i, /\bswift\b/i],
  'MSI': [/\bmsi\b/i, /\braider\b/i, /\bstealth\b/i, /\btitan\b/i, /\bprestige\b/i],
  'Samsung': [/\bsamsung\b/i, /\bgalaxy book\b/i, /\bodyssey\b/i],
  'Microsoft': [/\bmicrosoft\b/i, /\bsurface\b/i],
  'Razer': [/\brazer\b/i, /\bblade\b/i],
  'Alienware': [/\balienware\b/i],
  'LG': [/\blg\b/i, /\bgram\b/i]
};

/**
 * Detect the correct brand from the title and stored brand
 */
function detectCorrectBrand(title: string, storedBrand?: string): string {
  if (!title) {
    return correctBrandCapitalization(storedBrand) || 'Unknown Brand';
  }
  
  const titleLower = title.toLowerCase();
  
  // First check if the title contains known brand keywords
  for (const [brand, patterns] of Object.entries(BRAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(titleLower)) {
        return brand;
      }
    }
  }
  
  // If no brand pattern matched, use the stored brand
  return correctBrandCapitalization(storedBrand) || 'Unknown Brand';
}

/**
 * Correct brand capitalization
 */
function correctBrandCapitalization(brand?: string): string {
  if (!brand) return '';
  
  const normalizedBrand = brand.toLowerCase().trim();
  if (BRAND_CORRECTIONS[normalizedBrand]) {
    return BRAND_CORRECTIONS[normalizedBrand];
  }
  
  // If not a known brand, capitalize first letter
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}

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

  // Detect the correct brand from title and stored brand
  const detectedBrand = detectCorrectBrand(laptop.title, laptop.brand);

  // Process and create the laptop product object
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
    brand: detectedBrand,
    model: laptop.model || null,
    total_reviews: total_reviews,
    average_rating: rating,
    review_data: review_data
  };
};

export * from './titleProcessor';
export * from './specsProcessor';
export * from './graphicsProcessor';
export * from './physicalSpecsProcessor';

