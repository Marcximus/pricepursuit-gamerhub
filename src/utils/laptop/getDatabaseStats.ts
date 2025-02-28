
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

    // Get update and check status counts (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { count: notUpdatedCount, error: notUpdatedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .lt('last_updated', oneDayAgo.toISOString());

    if (notUpdatedError) {
      console.error('Error fetching not updated count:', notUpdatedError);
      throw notUpdatedError;
    }

    const { count: notCheckedCount, error: notCheckedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .lt('last_checked', oneDayAgo.toISOString());

    if (notCheckedError) {
      console.error('Error fetching not checked count:', notCheckedError);
      throw notCheckedError;
    }

    // Get AI processing status counts
    const { count: pendingCount, error: pendingError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'pending');

    if (pendingError) {
      console.error('Error fetching pending count:', pendingError);
      throw pendingError;
    }

    const { count: processingCount, error: processingError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'processing');

    if (processingError) {
      console.error('Error fetching processing count:', processingError);
      throw processingError;
    }

    const { count: errorCount, error: errorStatusError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'error');

    if (errorStatusError) {
      console.error('Error fetching error status count:', errorStatusError);
      throw errorStatusError;
    }

    const { count: completeCount, error: completeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'complete');

    if (completeError) {
      console.error('Error fetching complete count:', completeError);
      throw completeError;
    }

    // Calculate percentages
    const calculatePercentage = (count: number) => 
      totalCount ? Math.round((count / totalCount) * 100) : 0;
    
    const calculateInversePercentage = (count: number) => 
      totalCount ? Math.round(((totalCount - count) / totalCount) * 100) : 0;

    // Calculate AI processing completion percentage
    const processingCompletionPercentage = 
      totalCount ? Math.round((completeCount / totalCount) * 100) : 0;

    return {
      totalLaptops: totalCount || 0,
      updateStatus: {
        notUpdated: {
          count: notUpdatedCount || 0,
          percentage: calculatePercentage(notUpdatedCount || 0)
        },
        notChecked: {
          count: notCheckedCount || 0,
          percentage: calculatePercentage(notCheckedCount || 0)
        }
      },
      aiProcessingStatus: {
        pending: {
          count: pendingCount || 0,
          percentage: calculatePercentage(pendingCount || 0)
        },
        processing: {
          count: processingCount || 0,
          percentage: calculatePercentage(processingCount || 0)
        },
        error: {
          count: errorCount || 0,
          percentage: calculatePercentage(errorCount || 0)
        },
        complete: {
          count: completeCount || 0,
          percentage: calculatePercentage(completeCount || 0)
        },
        completionPercentage: processingCompletionPercentage
      },
      missingInformation: {
        prices: {
          count: totalCount - priceCount || 0,
          percentage: calculateInversePercentage(priceCount || 0)
        },
        processor: {
          count: totalCount - processorCount || 0,
          percentage: calculateInversePercentage(processorCount || 0)
        },
        ram: {
          count: totalCount - ramCount || 0,
          percentage: calculateInversePercentage(ramCount || 0)
        },
        storage: {
          count: totalCount - storageCount || 0,
          percentage: calculateInversePercentage(storageCount || 0)
        },
        graphics: {
          count: totalCount - graphicsCount || 0,
          percentage: calculateInversePercentage(graphicsCount || 0)
        },
        screenSize: {
          count: totalCount - screenSizeCount || 0,
          percentage: calculateInversePercentage(screenSizeCount || 0)
        }
      }
    };
  } catch (error) {
    console.error('Error in getDatabaseStats:', error);
    throw error;
  }
}
