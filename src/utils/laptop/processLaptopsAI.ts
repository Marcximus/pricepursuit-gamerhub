
import { supabase } from "@/integrations/supabase/client";

interface ProcessOptions {
  focus?: 'graphics' | 'processor' | 'ram' | 'storage' | 'all';
  limit?: number;
}

export async function processLaptopsAI(options: ProcessOptions = { focus: 'all', limit: 100 }) {
  try {
    console.log('Starting AI processing for laptops with options:', options);
    
    // Determine query based on focus area
    let query = supabase
      .from('products')
      .select('id, title, description, asin')
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'pending');
    
    // Apply focus filter if specified
    if (options.focus && options.focus !== 'all') {
      switch(options.focus) {
        case 'graphics':
          // Using direct comparison instead of length function
          query = query.or('graphics.is.null,graphics.eq.'); 
          break;
        case 'processor':
          query = query.or('processor.is.null,processor.eq.');
          break;
        case 'ram':
          query = query.or('ram.is.null,ram.eq.');
          break;
        case 'storage':
          query = query.or('storage.is.null,storage.eq.');
          break;
      }
    }
    
    // Apply limit
    query = query.limit(options.limit || 100);
    
    const { data: laptops, error } = await query;
    
    if (error) {
      console.error('Error fetching laptops for AI processing:', error);
      return { success: false, error: error.message };
    }
    
    if (!laptops || laptops.length === 0) {
      console.log('No laptops found for AI processing');
      return { success: true, processed: 0 };
    }
    
    // Mark laptops as in progress
    const lapTopIds = laptops.map(laptop => laptop.id);
    const { error: updateError } = await supabase
      .from('products')
      .update({ ai_processing_status: 'in_progress' })
      .in('id', lapTopIds);
    
    if (updateError) {
      console.error('Error marking laptops as in progress:', updateError);
      return { success: false, error: updateError.message };
    }
    
    // Call edge function to process laptops
    const response = await fetch('/api/process-laptops-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        laptops,
        focus: options.focus || 'all'
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from process-laptops-ai function:', errorText);
      return { success: false, error: errorText };
    }
    
    console.log(`Successfully started AI processing for ${laptops.length} laptops`);
    return { success: true, processed: laptops.length };
    
  } catch (error) {
    console.error('Error in processLaptopsAI:', error);
    return { success: false, error: error.message };
  }
}
