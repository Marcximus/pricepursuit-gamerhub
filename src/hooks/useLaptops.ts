
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";

export const collectLaptops = async () => {
  try {
    console.log('Triggering laptop collection...');
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      body: { action: 'collect' }
    });
    
    if (error) {
      console.error('Error collecting laptops:', error);
      throw new Error(error.message || 'Failed to collect laptops');
    }
    
    console.log('Laptop collection response:', data);
    toast({
      title: "Collection started",
      description: "The laptop collection process has started and will take several minutes to complete. The data will refresh automatically.",
    });
    return data;
  } catch (error) {
    console.error('Failed to collect laptops:', error);
    throw error;
  }
};

const processTitle = (title: string): string => {
  // Remove common prefixes and suffixes
  title = title.replace(/^(New|Latest|2024|2023)\s*/i, '');
  title = title.replace(/\([^)]*\)/g, ''); // Remove parentheses and their contents
  title = title.replace(/\[[^\]]*\]/g, ''); // Remove square brackets and their contents
  title = title.replace(/\s+/g, ' ').trim(); // Remove extra spaces
  return title;
};

const processProcessor = (processor: string | undefined): string | undefined => {
  if (!processor) return undefined;
  
  // Standardize processor names
  let processed = processor
    .replace(/Intel\s+Core\s+/i, '')
    .replace(/AMD\s+Ryzen\s+/i, 'Ryzen ')
    .replace(/\s+processor$/i, '')
    .trim();
    
  // Add generation if missing for Intel processors
  if (processed.match(/i[357]|i[357]-\d{4,5}/i)) {
    processed = processed.replace(/^(i[357])(?!-\d)/, '$1-12th Gen');
  }
  
  return processed;
};

const processRam = (ram: string | undefined): string | undefined => {
  if (!ram) return undefined;
  
  // Standardize RAM format
  return ram
    .replace(/^RAM\s+/i, '')
    .replace(/gigabytes?/i, 'GB')
    .replace(/(\d+)\s*GB?/i, '$1GB')
    .trim();
};

const processStorage = (storage: string | undefined): string | undefined => {
  if (!storage) return undefined;
  
  // Standardize storage format
  return storage
    .replace(/solid\s+state\s+drive/i, 'SSD')
    .replace(/hard\s+disk\s+drive/i, 'HDD')
    .replace(/(\d+)\s*(GB|TB)/i, '$1$2')
    .trim();
};

const processGraphics = (graphics: string | undefined): string | undefined => {
  if (!graphics) return undefined;
  
  // Standardize graphics card names
  return graphics
    .replace(/NVIDIA\s+GeForce\s+/i, '')
    .replace(/AMD\s+Radeon\s+/i, 'Radeon ')
    .replace(/Intel\s+/i, '')
    .replace(/\s+Graphics$/i, '')
    .trim();
};

const processScreenSize = (size: string | undefined): string | undefined => {
  if (!size) return undefined;
  
  // Standardize screen size format
  return size
    .replace(/(\d+(\.\d+)?)\s*inch(es)?/i, '$1"')
    .trim();
};

const processWeight = (weight: string | undefined): string | undefined => {
  if (!weight) return undefined;
  
  // Standardize weight format
  return weight
    .replace(/(\d+(\.\d+)?)\s*(kg|pounds?|lbs?)/i, (_, num, dec, unit) => {
      if (unit.toLowerCase().startsWith('lb')) {
        return `${(parseFloat(num) * 0.453592).toFixed(2)} kg`;
      }
      return `${num} kg`;
    })
    .trim();
};

const processBatteryLife = (battery: string | undefined): string | undefined => {
  if (!battery) return undefined;
  
  // Standardize battery life format
  return battery
    .replace(/up\s+to\s+/i, '')
    .replace(/(\d+(\.\d+)?)\s*(hour|hr)s?/i, '$1 hours')
    .trim();
};

const processLaptopData = (laptop: Product): Product => {
  return {
    ...laptop,
    title: processTitle(laptop.title || ''),
    processor: processProcessor(laptop.processor),
    ram: processRam(laptop.ram),
    storage: processStorage(laptop.storage),
    graphics: processGraphics(laptop.graphics),
    screen_size: processScreenSize(laptop.screen_size),
    weight: processWeight(laptop.weight),
    battery_life: processBatteryLife(laptop.battery_life)
  };
};

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      try {
        console.log('Fetching laptops from Supabase...');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_laptop', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching laptops:', error);
          return [];
        }

        if (!data || data.length === 0) {
          console.log('No laptops found in database');
          toast({
            title: "No laptops found",
            description: "Starting initial laptop collection...",
          });
          try {
            await collectLaptops();
          } catch (error) {
            console.error('Failed to start initial collection:', error);
          }
          return [];
        }

        console.log(`Found ${data.length} laptops from database`);
        // Process each laptop's data before returning
        return data.map(processLaptopData);
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours to cache the data
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch every 24 hours to check for updates
    retryDelay: 1000, // Wait 1 second between retries
    retry: 3, // Retry failed requests 3 times
    placeholderData: (previousData) => previousData?.map(processLaptopData), // Process previous data as well
  });

  return {
    ...query,
    collectLaptops,
  };
};
