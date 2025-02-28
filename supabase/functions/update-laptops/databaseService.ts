
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set')
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

export async function updateLaptopInDatabase(id: string, updateData: any) {
  try {
    console.log(`Updating laptop ${id} with data:`, JSON.stringify(updateData, null, 2).substring(0, 200) + '...')
    
    // Prepare the data to update
    const dataToUpdate = {
      ...updateData,
      last_checked: new Date().toISOString(),
      update_status: 'completed'
    }
    
    // Update the product in the database
    const { data, error } = await supabase
      .from('products')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error(`Database update error for laptop ${id}:`, error)
      return { 
        success: false, 
        error: `Database error: ${error.message}` 
      }
    }
    
    console.log(`Successfully updated laptop ${id} in database`)
    
    // Store price history if there's a price
    if (updateData.current_price) {
      try {
        await storePriceHistory(id, updateData.current_price)
      } catch (priceHistoryError) {
        console.error(`Error storing price history for ${id}:`, priceHistoryError)
        // Continue even if price history storage fails
      }
    }
    
    return { 
      success: true, 
      message: `Updated laptop ${id} successfully`,
      data
    }
  } catch (error) {
    console.error(`Error in updateLaptopInDatabase for ${id}:`, error)
    return { 
      success: false, 
      error: error.message || 'Unknown error in updateLaptopInDatabase'
    }
  }
}

async function storePriceHistory(productId: string, price: number) {
  try {
    // First check if we already have a price record for today to avoid duplicates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: existingRecords, error: checkError } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
    
    if (checkError) {
      console.error(`Error checking existing price history for ${productId}:`, checkError)
      return
    }
    
    // If we already have a record for today, don't add another one
    if (existingRecords && existingRecords.length > 0) {
      console.log(`Price history for ${productId} already exists for today, skipping`)
      return
    }
    
    // Insert new price history record
    const { error: insertError } = await supabase
      .from('price_history')
      .insert({
        product_id: productId,
        price: price,
        timestamp: new Date().toISOString()
      })
    
    if (insertError) {
      console.error(`Error inserting price history for ${productId}:`, insertError)
      return
    }
    
    console.log(`Successfully stored price history for ${productId}: $${price}`)
  } catch (error) {
    console.error(`Error in storePriceHistory for ${productId}:`, error)
  }
}
