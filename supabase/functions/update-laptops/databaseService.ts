
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types'
import { LaptopUpdateResult } from './types'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function updateLaptopInDatabase(
  laptopId: string,
  updateData: Record<string, any>
): Promise<LaptopUpdateResult> {
  try {
    console.log(`Updating laptop ${laptopId} with data:`, JSON.stringify(updateData, null, 2))

    // Ensure all necessary fields are included and properly processed
    const dataToUpdate = {
      // Basic information
      title: updateData.title || null,
      description: updateData.description || null,
      current_price: updateData.current_price !== undefined ? updateData.current_price : null,
      original_price: updateData.original_price !== undefined ? updateData.original_price : null,
      
      // Rating information
      rating: updateData.rating !== undefined ? updateData.rating : null,
      rating_count: updateData.rating_count !== undefined ? updateData.rating_count : null,
      total_reviews: updateData.total_reviews !== undefined ? updateData.total_reviews : null,
      average_rating: updateData.average_rating !== undefined ? updateData.average_rating : null,
      wilson_score: updateData.wilson_score !== undefined ? updateData.wilson_score : null,
      
      // Product details
      image_url: updateData.image_url || null,
      product_url: updateData.product_url || null,
      
      // Specifications
      processor: updateData.processor || null,
      ram: updateData.ram || null,
      storage: updateData.storage || null,
      graphics: updateData.graphics || null,
      screen_size: updateData.screen_size || null,
      screen_resolution: updateData.screen_resolution || null,
      weight: updateData.weight || null,
      battery_life: updateData.battery_life || null,
      brand: updateData.brand || null,
      model: updateData.model || null,
      
      // Review data as JSON
      review_data: updateData.review_data || null,
      
      // Status fields
      update_status: 'completed',
      last_checked: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    // First update the product record
    const { data, error } = await supabase
      .from('products')
      .update(dataToUpdate)
      .eq('id', laptopId)
      .select()

    if (error) {
      console.error(`Error updating laptop ${laptopId}:`, error)
      throw error
    }

    // If we have price data, add a price history record
    if (updateData.current_price !== undefined && updateData.current_price !== null) {
      const { error: priceHistoryError } = await supabase
        .from('price_history')
        .insert({
          product_id: laptopId,
          price: updateData.current_price,
          timestamp: new Date().toISOString()
        })

      if (priceHistoryError) {
        console.error(`Error adding price history for laptop ${laptopId}:`, priceHistoryError)
        // Don't throw here, as we've already updated the product
      } else {
        console.log(`Added price history record for laptop ${laptopId}: $${updateData.current_price}`)
      }
    }

    // If we have review data, insert or update reviews
    if (updateData.review_data?.recent_reviews?.length > 0) {
      console.log(`Processing ${updateData.review_data.recent_reviews.length} reviews for laptop ${laptopId}`)
      
      // Process each review
      for (const review of updateData.review_data.recent_reviews) {
        // Only process reviews with actual content
        if (review.content || review.title) {
          const reviewData = {
            product_id: laptopId,
            rating: review.rating,
            title: review.title || null,
            content: review.content || null,
            reviewer_name: review.reviewer_name || null,
            review_date: review.review_date ? new Date(review.review_date).toISOString() : null,
            verified_purchase: review.verified_purchase || false,
            helpful_votes: review.helpful_votes || 0
          }
          
          // Insert the review
          const { error: reviewError } = await supabase
            .from('product_reviews')
            .insert(reviewData)
            
          if (reviewError) {
            console.error(`Error adding review for laptop ${laptopId}:`, reviewError)
            // Don't throw here, continue with other reviews
          }
        }
      }
    }

    console.log(`Successfully updated laptop ${laptopId} with new data`)
    return {
      success: true,
      message: 'Laptop updated successfully',
      updatedId: laptopId,
      updatedData: dataToUpdate
    }
  } catch (error) {
    console.error(`Failed to update laptop ${laptopId}:`, error)
    
    // Update status to error in the database
    try {
      await supabase
        .from('products')
        .update({
          update_status: 'error',
          last_checked: new Date().toISOString()
        })
        .eq('id', laptopId)
    } catch (statusError) {
      console.error(`Failed to update status for laptop ${laptopId}:`, statusError)
    }
    
    return {
      success: false,
      message: `Failed to update laptop: ${error.message}`,
      error: error.message
    }
  }
}
