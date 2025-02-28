
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { normalizeGraphics } from "./normalizers/graphicsNormalizer";

export const updateGraphicsData = async () => {
  try {
    console.log('Starting graphics data normalization process...');
    
    // Get laptops with missing or empty graphics data
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, title, graphics, processor')
      .eq('is_laptop', true)
      .or('graphics.is.null,graphics.eq.')
      .order('last_checked', { ascending: false })
      .limit(100);

    if (fetchError) {
      console.error('Error fetching laptops with missing graphics:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found with missing graphics data');
      return { success: true, processed: 0, message: 'No laptops found with missing graphics data' };
    }

    console.log(`Found ${laptops.length} laptops with missing graphics data`);
    
    // Process each laptop
    let updatedCount = 0;
    
    for (const laptop of laptops) {
      // Extract graphics information from title
      const normalizedGraphics = normalizeGraphics(laptop.graphics || '', laptop.title || '');
      
      if (normalizedGraphics) {
        // Update the database
        const { error: updateError } = await supabase
          .from('products')
          .update({ graphics: normalizedGraphics })
          .eq('id', laptop.id);
          
        if (updateError) {
          console.error(`Error updating graphics for laptop ${laptop.id}:`, updateError);
          continue;
        }
        
        updatedCount++;
        console.log(`Updated graphics for ${laptop.id} to "${normalizedGraphics}"`);
      }
    }
    
    console.log(`Successfully updated graphics data for ${updatedCount} laptops`);
    
    return { 
      success: true, 
      processed: laptops.length,
      updated: updatedCount,
      message: `Updated graphics data for ${updatedCount} out of ${laptops.length} laptops`
    };
  } catch (error: any) {
    console.error('Error updating graphics data:', error);
    return { success: false, error: error.message };
  }
};
