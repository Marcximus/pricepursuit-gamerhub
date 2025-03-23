
/**
 * Service for enhancing comparison content with product data
 */
import { logError } from "../../utils/errorHandler.ts";

/**
 * Enhances comparison content with data from two products
 */
export function enhanceComparisonContent(parsedContent: any, product1: any, product2: any, asin1: string, asin2: string): any {
  console.log(`🔄 Augmenting comparison content with product data for both products`);
  try {
    parsedContent.comparisonData = {
      product1: {
        asin: asin1,
        title: product1.title,
        brand: product1.brand,
        price: product1.price?.current,
        rating: product1.rating?.rating,
        reviewCount: product1.rating?.rating_count,
        imageUrl: product1.images?.[0],
        productUrl: product1.url
      },
      product2: {
        asin: asin2,
        title: product2.title,
        brand: product2.brand,
        price: product2.price?.current,
        rating: product2.rating?.rating,
        reviewCount: product2.rating?.rating_count,
        imageUrl: product2.images?.[0],
        productUrl: product2.url
      }
    };
    console.log(`✅ Added comparison data for both products`);
    return parsedContent;
  } catch (error) {
    logError(error, 'Error enhancing comparison content');
    return parsedContent;
  }
}
