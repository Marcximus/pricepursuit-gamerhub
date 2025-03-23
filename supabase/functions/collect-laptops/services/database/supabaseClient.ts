
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Creates a Supabase client with the proper credentials
 * @returns Configured Supabase client
 */
export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}
