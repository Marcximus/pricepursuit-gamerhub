
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { fetchLaptopData } from './oxylabsService.ts';
import { getLaptopsToUpdate, updateLaptopStatus, updateLaptopData } from './databaseService.ts';
import { delay, parseRating, parseReviewCount, parsePrice } from './utils.ts';

const BATCH_SIZE = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    const laptops = await getLaptopsToUpdate(supabaseUrl, supabaseKey, BATCH_SIZE);

    if (!laptops || laptops.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No laptops need updating' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${laptops.length} laptops...`);
    await updateLaptopStatus(supabaseUrl, supabaseKey, laptops.map(l => l.id), 'in_progress');

    const updates = [];
    for (const laptop of laptops) {
      try {
        console.log(`Fetching data for ASIN: ${laptop.asin}`);
        const data = await fetchLaptopData(laptop.asin, username, password);
        const content = data.results[0].content;

        const updateData = {
          title: content.title || undefined,
          current_price: parsePrice(content.price),
          rating: parseRating(content.ratings),
          rating_count: parseReviewCount(content.reviews),
          brand: content.brand || undefined,
          model: content.model_name || undefined,
          processor: content.cpu_model || undefined,
          ram: content.ram_memory_installed_size || undefined,
          storage: content.hard_disk_size || undefined,
          screen_size: content.screen_size || undefined,
          graphics: content.graphics_card_description || content.graphics_coprocessor || undefined
        };

        await updateLaptopData(supabaseUrl, supabaseKey, laptop.id, updateData, 'completed');
        updates.push({ success: true, asin: laptop.asin });
        await delay(1000);

      } catch (error) {
        console.error(`Error updating laptop ${laptop.asin}:`, error);
        await updateLaptopData(supabaseUrl, supabaseKey, laptop.id, {}, 'error');
        updates.push({ success: false, asin: laptop.asin, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Update process completed',
        results: updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-laptops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

