
import { supabase } from "@/integrations/supabase/client";
import { processChunksSequentially } from "./chunkProcessor";

export const updateLaptops = async () => {
  try {
    console.log('Starting silent update for ALL laptops...');
    
    // Get laptops with priority for those that haven't been updated in the longest time
    // or missing image_url
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, title, last_checked, image_url')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .or(`last_checked.is.null,image_url.is.null`) // Prioritize laptops with no image URLs
      .order('last_checked', { nullsFirst: true }) // Prioritize laptops that have never been checked
      .limit(100); // Limit to a reasonable number

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found to update');
      return { success: false, message: 'No laptops found to update' };
    }

    // Format timestamps for logging
    const formattedLaptops = laptops.map(laptop => ({
      ...laptop,
      formattedLastChecked: laptop.last_checked ? new Date(laptop.last_checked).toLocaleString() : 'Never checked'
    }));

    // Log detailed info about laptops to be updated - now using ASIN as primary identifier
    console.log(`Found ${laptops.length} laptops to update with the following priority:`);
    formattedLaptops.forEach((laptop, index) => {
      console.log(`${index + 1}. ASIN: ${laptop.asin}, Title: ${laptop.title?.substring(0, 30)}..., Last Checked: ${laptop.formattedLastChecked}, Current Price: ${laptop.current_price === null ? 'NULL' : `$${laptop.current_price}`}, Has Image: ${laptop.image_url ? 'Yes' : 'No'}`);
    });

    // Log priority distribution
    logPriorityDistribution(formattedLaptops);

    // Split laptops into chunks of 10
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < laptops.length; i += chunkSize) {
      chunks.push(laptops.slice(i, i + chunkSize));
    }

    console.log(`Split updates into ${chunks.length} chunks of up to ${chunkSize} laptops each`);
    
    // Process each chunk sequentially in the background
    processChunksSequentially(chunks).catch(error => {
      console.error('Background process error:', error);
    });
    
    return { success: true, message: `Started updating ${laptops.length} laptops in ${chunks.length} chunks` };

  } catch (error: any) {
    console.error('Failed to update laptops:', error);
    return { success: false, error: error.message };
  }
};

function logPriorityDistribution(formattedLaptops) {
  // Group laptops by update status for better logging
  const neverCheckedLaptops = formattedLaptops.filter(l => !l.last_checked);
  const oldestCheckedLaptops = formattedLaptops.filter(l => l.last_checked).sort((a, b) => 
    new Date(a.last_checked).getTime() - new Date(b.last_checked).getTime()
  ).slice(0, 10);
  const nullPriceLaptops = formattedLaptops.filter(l => l.current_price === null);
  const noImageLaptops = formattedLaptops.filter(l => !l.image_url);
  
  console.log('Laptop update priority distribution:');
  console.log(`- Never checked (highest priority): ${neverCheckedLaptops.length} laptops`);
  console.log(`- Missing images: ${noImageLaptops.length} laptops`);
  
  if (oldestCheckedLaptops.length > 0) {
    console.log('- Oldest checked laptops:');
    oldestCheckedLaptops.forEach((l, i) => {
      console.log(`  ${i+1}. ASIN: ${l.asin}, Last checked: ${l.formattedLastChecked}, Price: ${l.current_price === null ? 'NULL' : `$${l.current_price}`}, Has Image: ${l.image_url ? 'Yes' : 'No'}`);
    });
  }
  
  console.log(`- NULL price laptops: ${nullPriceLaptops.length} laptops`);
}
