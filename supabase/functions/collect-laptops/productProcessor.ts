
import { extractLaptopSpecs } from './deepseekService';
import { LaptopProductData } from './types';
import { normalizeProductSpecs } from '@/utils/laptop/collectionUtils';

/**
 * Process raw product data into a structured format
 */
export async function processRawProduct(rawProduct: any): Promise<LaptopProductData | null> {
  try {
    if (!rawProduct || !rawProduct.asin) {
      console.error('Invalid product data:', rawProduct);
      return null;
    }

    let processedProduct: LaptopProductData = {
      asin: rawProduct.asin,
      title: rawProduct.title || '',
      current_price: extractPrice(rawProduct.price),
      original_price: extractPrice(rawProduct.original_price),
      rating: extractRating(rawProduct.rating),
      rating_count: extractRatingCount(rawProduct.rating_count),
      image_url: rawProduct.image_url || '',
      product_url: rawProduct.product_url || '',
      brand: extractBrand(rawProduct.title, rawProduct.brand),
      model: '',
      processor: '',
      ram: '',
      storage: '',
      graphics: '',
      screen_size: '',
      screen_resolution: '',
      weight: '',
      battery_life: ''
    };

    // Extract specifications from the product data
    const extractedSpecs = await extractLaptopSpecs(processedProduct.title);
    
    if (extractedSpecs) {
      processedProduct = {
        ...processedProduct,
        ...extractedSpecs
      };
    }

    // Normalize all specifications for consistency
    processedProduct = normalizeProductSpecs(processedProduct);

    return processedProduct;
  } catch (error) {
    console.error('Error processing product:', error);
    return null;
  }
}

/**
 * Extract and parse price from raw data
 */
function extractPrice(priceString: string | null | undefined): number | null {
  if (!priceString) return null;
  
  // Handle different price formats
  const priceMatch = priceString.toString().match(/[\d,]+\.?\d*/);
  if (priceMatch) {
    return parseFloat(priceMatch[0].replace(/,/g, ''));
  }
  return null;
}

/**
 * Extract and parse rating from raw data
 */
function extractRating(ratingString: string | null | undefined): number | null {
  if (!ratingString) return null;
  
  const ratingMatch = ratingString.toString().match(/[\d\.]+/);
  if (ratingMatch) {
    const rating = parseFloat(ratingMatch[0]);
    return rating > 5 ? rating / 20 : rating; // Handle 100-point scales
  }
  return null;
}

/**
 * Extract and parse rating count from raw data
 */
function extractRatingCount(countString: string | null | undefined): number | null {
  if (!countString) return null;
  
  const countMatch = countString.toString().match(/[\d,]+/);
  if (countMatch) {
    return parseInt(countMatch[0].replace(/,/g, ''));
  }
  return null;
}

/**
 * Extract brand information from title and raw brand data
 */
function extractBrand(title: string, rawBrand: string | null | undefined): string {
  if (rawBrand) return rawBrand;
  
  // Common laptop brands to check against the title
  const commonBrands = [
    'Apple', 'Dell', 'HP', 'ASUS', 'Lenovo', 'Acer',
    'Microsoft', 'MSI', 'Samsung', 'Razer', 'LG', 'Gigabyte'
  ];
  
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return 'Unknown Brand';
}
