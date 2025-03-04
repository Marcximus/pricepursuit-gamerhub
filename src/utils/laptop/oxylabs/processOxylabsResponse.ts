
import { logLaptopProcessingDetails } from "../collection/status/processingLogs";
import { extractBrand } from "./extractors/brandExtractor";
import { extractModel } from "./extractors/modelExtractor";
import { extractPrice, extractOriginalPrice } from "./extractors/priceExtractor";
import { extractImageUrl } from "./extractors/imageExtractor";
import { extractRating, extractReviewCount, extractReviewData } from "./extractors/reviewExtractor";
import { extractDescription } from "./extractors/descriptionExtractor";
import { extractProcessor } from "./extractors/processorExtractor";
import { extractRam } from "./extractors/ramExtractor";
import { extractStorage } from "./extractors/storageExtractor";
import { extractScreenSize, extractScreenResolution } from "./extractors/screenExtractor";
import { extractGraphics } from "./extractors/graphicsExtractor";
import { extractWeight } from "./extractors/weightExtractor";
import { extractOS } from "./extractors/osExtractor";
import { extractTouchscreen } from "./extractors/touchscreenExtractor";
import { extractColor } from "./extractors/colorExtractor";
import { processLaptopDescription } from "../../laptopUtils/descriptionProcessor";

/**
 * Advanced processor for the Oxylabs API response to extract comprehensive laptop details
 * @param apiResponse - The raw API response from Oxylabs
 * @returns Processed laptop data object
 */
export const processOxylabsResponse = (apiResponse: any): any => {
  if (!apiResponse || !apiResponse.results || !apiResponse.results.length) {
    console.error('Invalid or empty API response from Oxylabs');
    return null;
  }

  try {
    // Get the first result (primary product data)
    const content = apiResponse.results[0].content;
    console.log(`Processing Oxylabs data for ASIN: ${content.asin} | Title: ${content.title?.substring(0, 50)}...`);

    // Create a base laptop object with all data we can extract
    const laptop = {
      asin: content.asin,
      title: content.title || '',
      brand: extractBrand(content),
      model: extractModel(content),
      current_price: extractPrice(content),
      original_price: extractOriginalPrice(content),
      image_url: extractImageUrl(content),
      product_url: content.url || `https://www.amazon.com/dp/${content.asin}`,
      rating: extractRating(content),
      rating_count: extractReviewCount(content),
      description: extractDescription(content),
      processor: extractProcessor(content),
      ram: extractRam(content),
      storage: extractStorage(content),
      screen_size: extractScreenSize(content),
      screen_resolution: extractScreenResolution(content),
      graphics: extractGraphics(content),
      weight: extractWeight(content),
      operating_system: extractOS(content),
      touchscreen: extractTouchscreen(content),
      color: extractColor(content),
      review_data: extractReviewData(content),
      last_checked: new Date().toISOString()
    };

    // Enhanced processing with description analysis
    if (laptop.description) {
      const enhancedSpecs = processLaptopDescription(
        laptop.description, 
        laptop.title,
        {
          processor: laptop.processor,
          ram: laptop.ram,
          storage: laptop.storage,
          screen_size: laptop.screen_size,
          screen_resolution: laptop.screen_resolution,
          graphics: laptop.graphics,
          weight: laptop.weight,
          operating_system: laptop.operating_system,
          touchscreen: laptop.touchscreen,
          color: laptop.color
        }
      );
      
      // Merge the enhanced specs back into the laptop object
      Object.assign(laptop, enhancedSpecs);
    }

    // Log processing results for debugging
    console.log('Processed Oxylabs data:', {
      asin: laptop.asin,
      title: laptop.title?.substring(0, 50) + '...',
      brand: laptop.brand,
      model: laptop.model,
      price: laptop.current_price,
      hasImage: !!laptop.image_url,
      processor: laptop.processor,
      ram: laptop.ram,
      storage: laptop.storage,
      screen: laptop.screen_size,
      graphics: laptop.graphics
    });

    return laptop;
  } catch (error) {
    console.error('Error processing Oxylabs data:', error);
    return null;
  }
};
