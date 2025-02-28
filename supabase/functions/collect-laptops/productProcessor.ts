
/**
 * Processes a laptop product from Oxylabs and inserts or updates it in the database
 * @param product The product object from Oxylabs
 * @param brand The brand of the product
 * @param supabase Supabase client instance
 * @returns Result of the operation
 */
export async function processLaptopProduct(product: any, brand: string, supabase: any) {
  try {
    // Skip products without required fields
    if (!product.asin || !product.title) {
      console.log("Skipping product without required fields");
      return { success: false, action: 'skipped', reason: 'missing_required_fields' };
    }
    
    // Check if product already exists
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('asin', product.asin)
      .limit(1);
    
    if (fetchError) {
      console.error("Error checking if product exists:", fetchError);
      return { success: false, action: 'failed', reason: 'database_error' };
    }
    
    // Extract price from the product (handle different formats)
    const currentPrice = extractPrice(product.price);
    const originalPrice = extractPrice(product.price_strikethrough || product.price_original);
    
    // Build the product object
    const productData = {
      asin: product.asin,
      title: product.title,
      brand: brand,
      current_price: currentPrice,
      original_price: originalPrice || currentPrice,
      rating: parseFloat(product.rating) || null,
      rating_count: parseInt(product.reviews_count || product.ratings_total) || null,
      image_url: product.url_image || product.images?.[0],
      product_url: product.url,
      description: product.description || null,
      last_checked: new Date().toISOString(),
      is_laptop: true,
      collection_status: 'completed',
      update_status: 'pending'
    };
    
    // Either update existing product or insert new one
    if (existingProducts && existingProducts.length > 0) {
      // Update existing product
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('asin', product.asin);
      
      if (updateError) {
        console.error("Error updating product:", updateError);
        return { success: false, action: 'failed', reason: 'update_error' };
      }
      
      return { success: true, action: 'updated', id: existingProducts[0].id };
    } else {
      // Insert new product
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single();
      
      if (insertError) {
        console.error("Error inserting product:", insertError);
        return { success: false, action: 'failed', reason: 'insert_error' };
      }
      
      return { success: true, action: 'added', id: newProduct?.id };
    }
  } catch (error) {
    console.error("Error processing product:", error);
    return { success: false, action: 'failed', error: error.message };
  }
}

/**
 * Extracts a numeric price from various price formats
 * @param price Price in various formats
 * @returns Numeric price
 */
function extractPrice(price: any): number | null {
  if (!price) return null;
  
  // Handle object format {value: "123.45", currency: "USD"}
  if (typeof price === 'object' && price.value) {
    return extractNumericPrice(price.value);
  }
  
  // Handle string format
  if (typeof price === 'string') {
    return extractNumericPrice(price);
  }
  
  // Handle numeric format
  if (typeof price === 'number') {
    return price;
  }
  
  return null;
}

/**
 * Extracts numeric value from a price string
 * @param priceStr Price string
 * @returns Numeric price
 */
function extractNumericPrice(priceStr: string): number | null {
  if (!priceStr) return null;
  
  // Remove currency symbols and commas, then extract numeric value
  const numericValue = priceStr.replace(/[^0-9.]/g, '');
  const price = parseFloat(numericValue);
  
  return isNaN(price) ? null : price;
}
