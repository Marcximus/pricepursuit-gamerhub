
import { OxylabsResult, ProductData } from './types.ts';

export function processProduct(result: OxylabsResult['content']['results'][0], brand: string): ProductData | null {
  if (!result?.asin) {
    console.log('Skipping result without ASIN:', {
      title: result?.title || 'no title',
      price: result?.price?.value || 'no price',
      hasUrl: !!result?.url
    });
    return null;
  }

  const priceValue = result.price?.value || '0';
  const originalPriceValue = result.price?.original_price || result.price?.value || '0';
  const currentPrice = parseFloat(String(priceValue).replace(/[^0-9.]/g, ''));
  const originalPrice = parseFloat(String(originalPriceValue).replace(/[^0-9.]/g, ''));

  return {
    asin: result.asin,
    title: result.title || '',
    current_price: isNaN(currentPrice) ? null : currentPrice,
    original_price: isNaN(originalPrice) ? null : originalPrice,
    rating: parseFloat(result.rating || '0'),
    rating_count: parseInt(result.reviews?.rating_count?.replace(/[^0-9]/g, '') || '0'),
    image_url: result.image?.url || '',
    product_url: result.url || '',
    is_laptop: true,
    brand: brand,
    collection_status: 'completed',
    last_checked: new Date().toISOString(),
    last_collection_attempt: new Date().toISOString()
  };
}
