
import { supabase } from "@/integrations/supabase/client";

export interface DuplicateAsinResult {
  asin: string;
  count: number;
}

/**
 * Check for duplicate ASINs in the products table
 * @returns Array of ASINs with duplicate counts
 */
export async function checkForDuplicateAsins(): Promise<DuplicateAsinResult[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_duplicate_asins');
    
    if (error) {
      console.error('Error checking for duplicate ASINs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in checkForDuplicateAsins:', error);
    throw error;
  }
}
