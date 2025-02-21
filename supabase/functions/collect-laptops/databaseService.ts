
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ProductData } from './types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

export async function saveProduct(productData: ProductData): Promise<void> {
  const { error: upsertError } = await supabase
    .from('products')
    .upsert(productData, {
      onConflict: 'asin',
      ignoreDuplicates: false
    });

  if (upsertError) {
    console.error(`Error saving product ${productData.asin}:`, upsertError);
    throw upsertError;
  }
  
  console.log(`Successfully saved/updated product ${productData.asin}`);
}
