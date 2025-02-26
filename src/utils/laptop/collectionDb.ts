
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CollectionStats } from "./types";

export async function resetStaleCollections(staleTimeout: string) {
  const { error: cleanupError } = await supabase
    .from('products')
    .update({ collection_status: 'pending' })
    .eq('collection_status', 'in_progress')
    .lt('last_collection_attempt', staleTimeout);

  if (cleanupError) {
    console.error('Error cleaning up stale statuses:', cleanupError);
    throw cleanupError;
  }
}

export async function checkActiveCollections(staleTimeout: string) {
  const { data: activeCollections, error: statusError } = await supabase
    .from('products')
    .select('collection_status, last_collection_attempt')
    .eq('collection_status', 'in_progress')
    .gt('last_collection_attempt', staleTimeout)
    .limit(1);

  if (statusError) {
    console.error('Status check error:', statusError);
    throw statusError;
  }

  return activeCollections;
}

export async function updateBrandStatus(brand: string, status: 'in_progress' | 'completed' | 'pending') {
  const updateData = {
    collection_status: status,
    ...(status === 'in_progress' ? { last_collection_attempt: new Date().toISOString() } : {})
  };

  await supabase
    .from('products')
    .update(updateData)
    .eq('brand', brand);
}

export async function processPage(brand: string, page: number, groupIndex: number, brandIndex: number, totalBrands: number) {
  const { data: response, error: functionError } = await supabase.functions.invoke('collect-laptops', {
    body: {
      brands: [brand],
      pages_per_brand: 1,
      current_page: page,
      batch_number: groupIndex * 2 + brandIndex + 1,
      total_batches: totalBrands
    }
  });

  if (functionError) {
    console.error(`Edge function error for ${brand} page ${page}:`, functionError);
    return null;
  }

  return response;
}
