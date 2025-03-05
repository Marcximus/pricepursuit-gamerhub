
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";
import { Database } from "../_shared/supabase-types.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

// Create a Supabase client with the admin credentials
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
