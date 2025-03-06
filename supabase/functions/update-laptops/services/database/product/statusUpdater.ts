
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

/**
 * Update product status in database (completed or error)
 */
export async function updateProductStatus(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  status: 'completed' | 'error'
): Promise<void> {
  try {
    // Fixed: status should be "completed" not "complete"
    const finalStatus = status === 'completed' ? 'completed' : 'error';
    
    await supabase
      .from('products')
      .update({ update_status: finalStatus })
      .eq('id', productId);
      
    console.log(`Updated product ${productId} status to ${finalStatus}`);
  } catch (error) {
    console.error(`Error updating status for product ${productId}:`, error);
  }
}
