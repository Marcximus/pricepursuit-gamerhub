
import { OxylabsResult, ProductData } from './types.ts';

export function processProducts(result: OxylabsResult, brand: string): ProductData[] {
  console.log('Processing Oxylabs result:', {
    hasContent: !!result?.content,
    hasResults: !!result?.content?.results,
    paidResults: result?.content?.results?.paid?.length || 0,
    organicResults: result?.content?.results?.organic?.length || 0,
  });

  const validProducts: ProductData[] = [];
  const allResults = [
    ...(result?.content?.results?.paid || []),
    ...(result?.content?.results?.organic || [])
  ];

  for (const item of allResults) {
    if (!item.asin) {
      console.log('Skipping result without ASIN:', {
        title: item.title || 'no title',
        hasUrl: !!item.url,
        isSponsored: item.is_sponsored
      });
      continue;
    }

    try {
      const priceValue = item.price?.value || '0';
      const originalPriceValue = item.price?.original_price || item.price?.value || '0';
      const currentPrice = parseFloat(String(priceValue).replace(/[^0-9.]/g, ''));
      const originalPrice = parseFloat(String(originalPriceValue).replace(/[^0-9.]/g, ''));

      const productData: ProductData = {
        asin: item.asin,
        title: item.title || '',
        current_price: isNaN(currentPrice) ? null : currentPrice,
        original_price: isNaN(originalPrice) ? null : originalPrice,
        rating: typeof item.rating === 'number' ? item.rating : 0,
        rating_count: typeof item.reviews_count === 'number' ? item.reviews_count : 0,
        image_url: item.url_image || '',
        product_url: item.url || '',
        is_laptop: true,
        brand: brand,
        collection_status: 'completed',
        last_checked: new Date().toISOString(),
        last_collection_attempt: new Date().toISOString()
      };

      validProducts.push(productData);
    } catch (error) {
      console.error('Error processing product:', {
        asin: item.asin,
        error: error.message,
        item: JSON.stringify(item)
      });
    }
  }

  console.log(`Processed ${validProducts.length} valid products for brand ${brand}`);
  return validProducts;
}
