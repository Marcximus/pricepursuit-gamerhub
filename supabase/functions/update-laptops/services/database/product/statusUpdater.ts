
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
    await supabase
      .from('products')
      .update({ update_status: status })
      .eq('id', productId);
  } catch (error) {
    console.error(`Error updating status for product ${productId}:`, error);
  }
}
