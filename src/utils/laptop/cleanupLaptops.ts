import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { containsForbiddenKeywords } from "./productFilters";

/**
 * Cleans up the database by removing products with forbidden keywords in titles
 * and removing duplicate ASINs (keeping the most recent one)
 * 
 * @returns Object with count of removed products
 */
export const cleanupLaptopDatabase = async () => {
  try {
    toast({
      title: "Database Cleanup",
      description: "Starting cleanup of laptop database. This may take a few moments...",
    });

    // 1. First identify products with forbidden keywords
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select(`
        id, 
        title, 
        asin
      `)
      .eq('is_laptop', true);

    if (fetchError) {
      console.error('Error fetching products for cleanup:', fetchError);
      toast({
        title: "Cleanup Failed",
        description: `Error fetching products: ${fetchError.message}`,
        variant: "destructive"
      });
      return { success: false, error: fetchError };
    }

    // Find products with forbidden keywords
    const productsWithForbiddenKeywords = products.filter(product => 
      containsForbiddenKeywords(product.title || '')
    );

    console.log(`Found ${productsWithForbiddenKeywords.length} products with forbidden keywords`);
    console.log('Sample products with forbidden keywords:', 
      productsWithForbiddenKeywords.slice(0, 5).map(p => ({
        id: p.id,
        title: p.title
      }))
    );

    // 2. Delete products with forbidden keywords
    if (productsWithForbiddenKeywords.length > 0) {
      const forbiddenIds = productsWithForbiddenKeywords.map(p => p.id);
      
      // Use a more reliable batch delete approach
      // Delete in batches of 100 to avoid overwhelming the database
      const BATCH_SIZE = 100;
      let successfullyDeletedCount = 0;
      
      for (let i = 0; i < forbiddenIds.length; i += BATCH_SIZE) {
        const batchIds = forbiddenIds.slice(i, i + BATCH_SIZE);
        
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', batchIds);

        if (deleteError) {
          console.error(`Error deleting batch ${i / BATCH_SIZE + 1}:`, deleteError);
        } else {
          successfullyDeletedCount += batchIds.length;
          console.log(`Successfully deleted batch ${i / BATCH_SIZE + 1} (${batchIds.length} products)`);
        }
      }

      if (successfullyDeletedCount !== forbiddenIds.length) {
        console.warn(`Only deleted ${successfullyDeletedCount} out of ${forbiddenIds.length} products with forbidden keywords`);
        toast({
          title: "Cleanup Partial Success",
          description: `Deleted ${successfullyDeletedCount} out of ${forbiddenIds.length} products with forbidden keywords`,
          variant: "destructive"
        });
      } else {
        console.log(`Successfully deleted all ${forbiddenIds.length} products with forbidden keywords`);
      }
    }

    // 3. Find duplicate ASINs - using a direct query instead of RPC
    // Since we created a SQL function previously, we can query for duplicate ASINs directly
    const { data: duplicateAsinsResult, error: asinQueryError } = await supabase
      .rpc('get_duplicate_asins');

    if (asinQueryError) {
      console.error('Error finding duplicate ASINs:', asinQueryError);
      toast({
        title: "Duplicate ASIN Check Failed",
        description: `Error finding duplicates: ${asinQueryError.message}`,
        variant: "destructive"
      });
    } else if (duplicateAsinsResult && duplicateAsinsResult.length > 0) {
      console.log(`Found ${duplicateAsinsResult.length} duplicate ASINs`);
      
      // For each duplicate ASIN, keep the most recent record and delete others
      let totalDuplicatesRemoved = 0;
      
      for (const item of duplicateAsinsResult) {
        const asin = item.asin;
        
        // Get all records for this ASIN, ordered by last_checked (most recent first)
        const { data: duplicates, error: dupError } = await supabase
          .from('products')
          .select('id, asin, last_checked')
          .eq('asin', asin)
          .order('last_checked', { ascending: false });
          
        if (dupError || !duplicates || duplicates.length <= 1) continue;
        
        // Keep the first record (most recent) and delete the rest
        const idsToDelete = duplicates.slice(1).map(d => d.id);
        
        if (idsToDelete.length > 0) {
          const { error: deleteDupError } = await supabase
            .from('products')
            .delete()
            .in('id', idsToDelete);
            
          if (!deleteDupError) {
            totalDuplicatesRemoved += idsToDelete.length;
          }
        }
      }
      
      console.log(`Removed ${totalDuplicatesRemoved} duplicate ASIN records`);
    }

    toast({
      title: "Database Cleanup Complete",
      description: `Removed ${productsWithForbiddenKeywords.length} products with forbidden keywords and addressed duplicate ASINs.`,
    });

    return { 
      success: true, 
      removedForbiddenKeywords: productsWithForbiddenKeywords.length 
    };

  } catch (error: any) {
    console.error('Error in database cleanup:', error);
    toast({
      title: "Cleanup Failed",
      description: `Error: ${error.message}`,
      variant: "destructive"
    });
    return { success: false, error };
  }
};
