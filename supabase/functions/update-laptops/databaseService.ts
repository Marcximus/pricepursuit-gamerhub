
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

export async function getLaptopsToUpdate(supabaseUrl: string, supabaseKey: string, batchSize: number) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: laptops, error: fetchError } = await supabase
    .from('products')
    .select('id, asin')
    .eq('is_laptop', true)
    .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'')
    .order('last_checked', { ascending: true })
    .limit(batchSize);

  if (fetchError) {
    throw new Error(`Failed to fetch laptops: ${fetchError.message}`);
  }

  return laptops;
}

export async function updateLaptopStatus(supabaseUrl: string, supabaseKey: string, laptopIds: string[], status: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from('products')
    .update({ update_status: status })
    .in('id', laptopIds);

  if (error) {
    throw new Error(`Failed to update laptop status: ${error.message}`);
  }
}

export async function updateLaptopData(
  supabaseUrl: string, 
  supabaseKey: string, 
  laptopId: string, 
  data: any, 
  status: string
) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from('products')
    .update({
      ...data,
      last_checked: new Date().toISOString(),
      update_status: status
    })
    .eq('id', laptopId);

  if (error) {
    throw new Error(`Failed to update laptop data: ${error.message}`);
  }
}
