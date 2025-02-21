
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Starting update for ALL laptops...');
    
    // Get ALL laptops
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true);

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      throw fetchError;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found');
      toast({
        title: "No laptops found",
        description: "No laptops available in the database",
      });
      return null;
    }

    console.log(`Found ${laptops.length} laptops to update`);

    // Call Oxylabs API for each laptop
    const results = [];
    for (const laptop of laptops) {
      try {
        console.log(`Fetching data for ASIN: ${laptop.asin}`);
        
        const payload = {
          source: 'amazon_product',
          query: laptop.asin,
          domain: 'com',
          geo_location: '90210',
          parse: true
        };

        const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${process.env.OXYLABS_USERNAME}:${process.env.OXYLABS_PASSWORD}`)
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Oxylabs response:', data);
        results.push(data);

        // Add a 1-second delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error updating laptop ${laptop.asin}:`, error);
      }
    }

    console.log('Update complete');
    toast({
      title: "Update complete",
      description: `Processed ${laptops.length} laptops`,
    });

    return results;

  } catch (error: any) {
    console.error('Failed to update laptops:', error);
    toast({
      title: "Update failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};
