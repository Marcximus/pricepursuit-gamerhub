
import { supabase } from '@/integrations/supabase/client';
import { StatsCountResult } from './types';

export const getTotalLaptopCount = async (): Promise<StatsCountResult> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true);

    if (error) {
      console.error('Error getting total laptop count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Exception getting total laptop count:', err);
    return { count: 0, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const getLaptopsWithPriceCount = async (): Promise<StatsCountResult> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('current_price', 'is', null);

    if (error) {
      console.error('Error getting laptops with price count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Exception getting laptops with price count:', err);
    return { count: 0, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const getLaptopsWithProcessorCount = async (): Promise<StatsCountResult> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('processor', 'is', null);

    if (error) {
      console.error('Error getting laptops with processor count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Exception getting laptops with processor count:', err);
    return { count: 0, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const getLaptopsWithRamCount = async (): Promise<StatsCountResult> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('ram', 'is', null);

    if (error) {
      console.error('Error getting laptops with RAM count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Exception getting laptops with RAM count:', err);
    return { count: 0, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const getLaptopsWithStorageCount = async (): Promise<StatsCountResult> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('storage', 'is', null);

    if (error) {
      console.error('Error getting laptops with storage count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Exception getting laptops with storage count:', err);
    return { count: 0, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const getLaptopsWithGraphicsCount = async (): Promise<StatsCountResult> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('graphics', 'is', null);

    if (error) {
      console.error('Error getting laptops with graphics count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Exception getting laptops with graphics count:', err);
    return { count: 0, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const getLaptopsWithScreenSizeCount = async (): Promise<StatsCountResult> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('screen_size', 'is', null);

    if (error) {
      console.error('Error getting laptops with screen size count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (err) {
    console.error('Exception getting laptops with screen size count:', err);
    return { count: 0, error: err instanceof Error ? err : new Error(String(err)) };
  }
};

export const getSampleLaptopsWithMissingInfo = async (limit = 5): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, asin, title, processor, ram, storage, graphics, screen_size, current_price, last_checked, update_status')
      .eq('is_laptop', true)
      .or('processor.is.null,ram.is.null,storage.is.null,graphics.is.null,screen_size.is.null')
      .order('last_checked', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting sample laptops with missing info:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception getting sample laptops with missing info:', err);
    return [];
  }
};
