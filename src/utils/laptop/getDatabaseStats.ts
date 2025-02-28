
import { supabase } from "@/integrations/supabase/client";

export async function getDatabaseStats() {
  try {
    console.log('Fetching database statistics...');
    
    // Get total count of laptop products
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true);

    if (countError) {
      console.error('Error fetching total count:', countError);
      throw countError;
    }

    // Get count of products with valid prices
    const { count: priceCount, error: priceError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('current_price', 'is', null);

    if (priceError) {
      console.error('Error fetching price count:', priceError);
      throw priceError;
    }

    // Get count of products with valid processor data
    const { count: processorCount, error: processorError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('processor', 'is', null)
      .neq('processor', '');

    if (processorError) {
      console.error('Error fetching processor count:', processorError);
      throw processorError;
    }

    // Get count of products with valid RAM data
    const { count: ramCount, error: ramError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('ram', 'is', null)
      .neq('ram', '');

    if (ramError) {
      console.error('Error fetching RAM count:', ramError);
      throw ramError;
    }

    // Get count of products with valid storage data
    const { count: storageCount, error: storageError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('storage', 'is', null)
      .neq('storage', '');

    if (storageError) {
      console.error('Error fetching storage count:', storageError);
      throw storageError;
    }

    // Get count of products with valid graphics data
    const { count: graphicsCount, error: graphicsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('graphics', 'is', null)
      .neq('graphics', '');

    if (graphicsError) {
      console.error('Error fetching graphics count:', graphicsError);
      throw graphicsError;
    }

    // Get count of products with valid screen size data
    const { count: screenSizeCount, error: screenSizeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('screen_size', 'is', null)
      .neq('screen_size', '');

    if (screenSizeError) {
      console.error('Error fetching screen size count:', screenSizeError);
      throw screenSizeError;
    }

    // Calculate percentages
    const calculatePercentage = (count: number) => 
      totalCount ? Math.round((count / totalCount) * 100) : 0;

    return {
      totalLaptops: totalCount || 0,
      withPrice: {
        count: priceCount || 0,
        percentage: calculatePercentage(priceCount || 0)
      },
      withProcessor: {
        count: processorCount || 0,
        percentage: calculatePercentage(processorCount || 0)
      },
      withRam: {
        count: ramCount || 0,
        percentage: calculatePercentage(ramCount || 0)
      },
      withStorage: {
        count: storageCount || 0,
        percentage: calculatePercentage(storageCount || 0)
      },
      withGraphics: {
        count: graphicsCount || 0,
        percentage: calculatePercentage(graphicsCount || 0)
      },
      withScreenSize: {
        count: screenSizeCount || 0,
        percentage: calculatePercentage(screenSizeCount || 0)
      }
    };
  } catch (error) {
    console.error('Error in getDatabaseStats:', error);
    throw error;
  }
}
