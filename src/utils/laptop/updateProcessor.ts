
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Updates the processor information for a specific product ASIN
 * @param asin The ASIN of the product to update
 * @param processorValue The new processor value to set
 */
export const updateProductProcessor = async (
  asin: string,
  processorValue: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Updating processor for ASIN ${asin} to "${processorValue}"`);
    
    // Update the processor field for the specified ASIN
    const { data, error, count } = await supabase
      .from('products')
      .update({ 
        processor: processorValue,
        // Also update the last_updated timestamp
        last_updated: new Date().toISOString()
      })
      .eq('asin', asin)
      .select('title')
      .limit(1);
    
    if (error) {
      console.error(`Error updating processor for ASIN ${asin}:`, error);
      return { 
        success: false, 
        message: `Failed to update processor for ASIN ${asin}: ${error.message}` 
      };
    }
    
    if (count === 0) {
      console.warn(`No product found with ASIN ${asin}`);
      return { 
        success: false, 
        message: `No product found with ASIN ${asin}` 
      };
    }
    
    const productTitle = data?.[0]?.title || 'Unknown product';
    console.log(`Successfully updated processor for ${productTitle} (${asin}) to "${processorValue}"`);
    
    return { 
      success: true, 
      message: `Updated processor for "${productTitle}" to "${processorValue}"` 
    };
  } catch (error: any) {
    console.error(`Unexpected error updating processor for ASIN ${asin}:`, error);
    return { 
      success: false, 
      message: `Unexpected error: ${error.message}` 
    };
  }
};

/**
 * Updates the processor information for multiple product ASINs
 * @param updates Array of {asin, processorValue} objects to update
 */
export const updateMultipleProcessors = async (
  updates: Array<{ asin: string; processorValue: string }>
): Promise<{ success: boolean; results: Array<{ asin: string; success: boolean; message: string }> }> => {
  const results = [];
  let overallSuccess = true;
  
  console.log(`Starting batch update for ${updates.length} processors`);
  
  for (const update of updates) {
    const result = await updateProductProcessor(update.asin, update.processorValue);
    results.push({
      asin: update.asin,
      success: result.success,
      message: result.message
    });
    
    if (!result.success) {
      overallSuccess = false;
    }
  }
  
  return {
    success: overallSuccess,
    results
  };
};
