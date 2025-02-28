
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
      // Properly handle price data
      let currentPrice = null;
      let originalPrice = null;

      // Check organic result price first (most reliable)
      if (typeof item.price === 'number' && !isNaN(item.price)) {
        currentPrice = item.price;
        // If there's a strikethrough price, use it as original price
        if (typeof item.price_strikethrough === 'number' && !isNaN(item.price_strikethrough)) {
          originalPrice = item.price_strikethrough;
        }
      }

      // Log price processing for debugging
      console.log('Processing price for ASIN:', {
        asin: item.asin,
        rawPrice: item.price,
        rawStrikethrough: item.price_strikethrough,
        processedCurrentPrice: currentPrice,
        processedOriginalPrice: originalPrice
      });

      const productData: ProductData = {
        asin: item.asin,
        title: item.title || '',
        current_price: currentPrice,
        original_price: originalPrice,
        rating: typeof item.rating === 'number' ? item.rating : null,
        rating_count: typeof item.reviews_count === 'number' ? item.reviews_count : null,
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

  // Log summary of processed products
  console.log(`Processed ${validProducts.length} valid products for brand ${brand}. Products with prices:`, {
    totalProducts: validProducts.length,
    productsWithPrices: validProducts.filter(p => p.current_price !== null).length,
    priceRange: validProducts.length > 0 ? {
      min: Math.min(...validProducts.filter(p => p.current_price !== null).map(p => p.current_price || 0)),
      max: Math.max(...validProducts.filter(p => p.current_price !== null).map(p => p.current_price || 0))
    } : 'no prices'
  });

  return validProducts;
}
