
import { supabase } from './supabaseClient.ts'

export async function processProduct(product: any, brand: string, detailedLogging = false) {
  try {
    if (!product || !product.asin) {
      if (detailedLogging) {
        console.log('Skipping invalid product (missing ASIN):', product)
      }
      return { status: 'skipped', reason: 'Invalid product data - missing ASIN' }
    }

    const asin = product.asin
    
    if (detailedLogging) {
      console.log(`Processing product ASIN: ${asin}, Title: ${product.title || 'N/A'}`)
    }

    // Check if product already exists
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('asin', asin)
      .limit(1)

    if (checkError) {
      console.error(`Database error checking product existence for ASIN ${asin}:`, checkError)
      return { status: 'failed', error: checkError.message }
    }

    const existingProduct = existingProducts && existingProducts.length > 0 ? existingProducts[0] : null
    
    if (detailedLogging && existingProduct) {
      console.log(`Found existing product with ASIN ${asin}`)
    }

    // Extract relevant data from the product
    const productData = {
      asin: asin,
      title: product.title || '',
      brand: brand,
      is_laptop: true,
      image_url: product.image || '',
      current_price: parseFloat(product.price?.value || '0') || null,
      rating: parseFloat(product.rating?.value || '0') || null,
      total_reviews: parseInt(product.reviews?.total_reviews || '0') || null,
      collection_status: 'completed',
      last_collection_attempt: new Date().toISOString(),
      // Add other fields as available
    }

    if (detailedLogging) {
      console.log(`Processed data for ASIN ${asin}:`, productData)
    }

    if (existingProduct) {
      // Update existing product
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existingProduct.id)
        .select()

      if (updateError) {
        console.error(`Error updating product with ASIN ${asin}:`, updateError)
        return { status: 'failed', error: updateError.message }
      }

      if (detailedLogging) {
        console.log(`Successfully updated product with ASIN ${asin}`)
        console.log('Updated data:', updatedProduct)
      }

      return { status: 'updated', id: existingProduct.id }
    } else {
      // Insert new product
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert(productData)
        .select()

      if (insertError) {
        console.error(`Error inserting new product with ASIN ${asin}:`, insertError)
        return { status: 'failed', error: insertError.message }
      }

      if (detailedLogging) {
        console.log(`Successfully added new product with ASIN ${asin}`)
        console.log('New product data:', newProduct)
      }

      return { status: 'added', id: newProduct?.[0]?.id }
    }
  } catch (error) {
    console.error(`Error processing product:`, error)
    return { status: 'failed', error: error.message || 'Unknown error' }
  }
}
