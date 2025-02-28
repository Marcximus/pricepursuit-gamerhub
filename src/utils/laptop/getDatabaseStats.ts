
import { supabase } from "@/integrations/supabase/client";

export type DatabaseStats = {
  totalLaptops: number;
  missingPrices: number;
  missingProcessor: number;
  missingRam: number;
  missingStorage: number;
  missingGraphics: number;
  missingScreenSize: number;
  notUpdated24h: number;
  notChecked24h: number;
  aiPending: number;
  aiProcessing: number;
  aiError: number;
  aiComplete: number;
  loading: boolean;
  error: string | null;
};

export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  try {
    console.log('Fetching database statistics...');
    
    // Get total laptops count
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true);
      
    if (countError) throw new Error(countError.message);
    
    // Get count of laptops missing prices
    const { count: missingPrices, error: priceError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('current_price.is.null,current_price.eq.0');
      
    if (priceError) throw new Error(priceError.message);
    
    // Get count of laptops missing processor
    const { count: missingProcessor, error: processorError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('processor.is.null,processor.eq.');
      
    if (processorError) throw new Error(processorError.message);
    
    // Get count of laptops missing RAM
    const { count: missingRam, error: ramError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('ram.is.null,ram.eq.');
      
    if (ramError) throw new Error(ramError.message);
    
    // Get count of laptops missing storage
    const { count: missingStorage, error: storageError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('storage.is.null,storage.eq.');
      
    if (storageError) throw new Error(storageError.message);
    
    // Get count of laptops missing graphics
    const { count: missingGraphics, error: graphicsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('graphics.is.null,graphics.eq.');
      
    if (graphicsError) throw new Error(graphicsError.message);
    
    // Get count of laptops missing screen size
    const { count: missingScreenSize, error: screenSizeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('screen_size.is.null,screen_size.eq.');
      
    if (screenSizeError) throw new Error(screenSizeError.message);
    
    // Get count of laptops not updated in 24 hours
    const { count: notUpdated24h, error: notUpdatedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('last_updated.is.null,last_updated.lt.' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
    if (notUpdatedError) throw new Error(notUpdatedError.message);
    
    // Get count of laptops not checked in 24 hours
    const { count: notChecked24h, error: notCheckedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('last_checked.is.null,last_checked.lt.' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
    if (notCheckedError) throw new Error(notCheckedError.message);
    
    // Get AI processing status counts
    const { count: aiPending, error: aiPendingError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'pending');
      
    if (aiPendingError) throw new Error(aiPendingError.message);
    
    const { count: aiProcessing, error: aiProcessingError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'processing');
      
    if (aiProcessingError) throw new Error(aiProcessingError.message);
    
    const { count: aiError, error: aiErrorsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'error');
      
    if (aiErrorsError) throw new Error(aiErrorsError.message);
    
    const { count: aiComplete, error: aiCompleteError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'complete');
      
    if (aiCompleteError) throw new Error(aiCompleteError.message);
    
    return {
      totalLaptops: totalCount || 0,
      missingPrices: missingPrices || 0,
      missingProcessor: missingProcessor || 0,
      missingRam: missingRam || 0,
      missingStorage: missingStorage || 0,
      missingGraphics: missingGraphics || 0,
      missingScreenSize: missingScreenSize || 0,
      notUpdated24h: notUpdated24h || 0,
      notChecked24h: notChecked24h || 0,
      aiPending: aiPending || 0,
      aiProcessing: aiProcessing || 0,
      aiError: aiError || 0,
      aiComplete: aiComplete || 0,
      loading: false,
      error: null
    };
  } catch (error) {
    console.error('Error fetching database statistics:', error);
    return {
      totalLaptops: 0,
      missingPrices: 0,
      missingProcessor: 0,
      missingRam: 0,
      missingStorage: 0,
      missingGraphics: 0,
      missingScreenSize: 0,
      notUpdated24h: 0,
      notChecked24h: 0,
      aiPending: 0,
      aiProcessing: 0,
      aiError: 0,
      aiComplete: 0,
      loading: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
