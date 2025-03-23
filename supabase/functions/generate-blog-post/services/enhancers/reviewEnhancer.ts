
/**
 * Service for enhancing review content with product data
 */
import { logError } from "../../utils/errorHandler.ts";

/**
 * Enhances review content with product data
 */
export function enhanceReviewContent(parsedContent: any, productData: any, asin: string): any {
  console.log(`🔄 Augmenting review content with product data`);
  try {
    parsedContent.productData = {
      asin,
      title: productData.title,
      brand: productData.brand,
      price: productData.price?.current,
      rating: productData.rating?.rating,
      reviewCount: productData.rating?.rating_count,
      imageUrl: productData.images?.[0],
      productUrl: productData.url
    };
    console.log(`✅ Added product data to review content`);
    return parsedContent;
  } catch (error) {
    logError(error, 'Error enhancing review content');
    return parsedContent;
  }
}
