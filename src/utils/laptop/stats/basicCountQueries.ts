
import { supabase } from '@/integrations/supabase/client';

export const getTotalLaptopCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true);

    if (error) {
      console.error('Error getting total laptop count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting total laptop count:', err);
    return 0;
  }
};

export const getLaptopsWithPriceCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('current_price', 'is', null);

    if (error) {
      console.error('Error getting laptops with price count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting laptops with price count:', err);
    return 0;
  }
};

export const getLaptopsWithProcessorCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('processor', 'is', null);

    if (error) {
      console.error('Error getting laptops with processor count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting laptops with processor count:', err);
    return 0;
  }
};

export const getLaptopsWithRamCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('ram', 'is', null);

    if (error) {
      console.error('Error getting laptops with RAM count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting laptops with RAM count:', err);
    return 0;
  }
};

export const getLaptopsWithStorageCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('storage', 'is', null);

    if (error) {
      console.error('Error getting laptops with storage count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting laptops with storage count:', err);
    return 0;
  }
};

export const getLaptopsWithGraphicsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('graphics', 'is', null);

    if (error) {
      console.error('Error getting laptops with graphics count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting laptops with graphics count:', err);
    return 0;
  }
};

export const getLaptopsWithScreenSizeCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('screen_size', 'is', null);

    if (error) {
      console.error('Error getting laptops with screen size count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting laptops with screen size count:', err);
    return 0;
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
