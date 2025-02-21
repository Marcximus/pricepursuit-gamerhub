
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
  if (!title) return '';
  
  // Remove common marketing terms and extras
  let processed = title
    .replace(/^(New|Latest|2024|2023|Updated)\s*/i, '')
    .replace(/\([^)]*\)/g, '') // Remove parentheses and contents
    .replace(/\[[^\]]*\]/g, '') // Remove square brackets and contents
    .replace(/with Windows \d+( Home| Pro)?/i, '')
    .replace(/\b(Gaming|Business|Student)\s*(Laptop|Notebook)?\b/i, '')
    .replace(/\b(Free|Premium|Professional)\s+\w+(\s+\w+)?\b/i, '')
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim();
    
  // Limit length and add ellipsis if needed
  return processed.length > 80 ? processed.substring(0, 77) + '...' : processed;
};

const processProcessor = (processor: string | undefined): string | undefined => {
  if (!processor) return undefined;
  
  let processed = processor
    .replace(/\s*processor\s*/i, '')
    .replace(/\s*CPU\s*/i, '')
    .trim();
    
  // Process Intel processors
  if (processed.toLowerCase().includes('intel')) {
    processed = processed
      .replace(/Intel\s*Core\s*/i, '')
      .replace(/\s*processor\s*/i, '')
      .replace(/(\d+)th\s*Gen\s*/i, '$1th Gen ')
      .replace(/(\d+)nd\s*Gen\s*/i, '$1nd Gen ')
      .replace(/(\d+)rd\s*Gen\s*/i, '$1rd Gen ')
      .trim();
      
    // Add generation if missing for newer Intel processors
    if (processed.match(/i[357959](?!-\d)/i)) {
      processed = processed.replace(/^(i[357959])(?!-|\d)/i, '$1-13th Gen');
    }
  }
  
  // Process AMD processors
  if (processed.toLowerCase().includes('amd')) {
    processed = processed
      .replace(/AMD\s*/i, '')
      .replace(/\s*processor\s*/i, '')
      .replace(/Ryzen\s*(\d+)\s*/i, 'Ryzen $1 ')
      .trim();
  }
  
  return processed;
};

const processRam = (ram: string | undefined): string | undefined => {
  if (!ram) return undefined;
  
  let processed = ram
    .replace(/^RAM\s*/i, '')
    .replace(/\s*Memory\s*/i, '')
    .replace(/DDR\d+/i, '') // Remove DDR version
    .replace(/\s*RAM\s*/i, '')
    .replace(/gigabytes?\b/i, 'GB')
    .trim();
    
  // Extract the number and standardize format
  const match = processed.match(/(\d+)\s*GB?/i);
  if (match) {
    return `${match[1]}GB`;
  }
  
  return processed;
};

const processStorage = (storage: string | undefined): string | undefined => {
  if (!storage) return undefined;
  
  let processed = storage
    .replace(/solid\s*state\s*drive/i, 'SSD')
    .replace(/hard\s*disk\s*drive/i, 'HDD')
    .replace(/\s*PCIe\s*NVMe\s*M\.2\s*/i, ' ')
    .trim();
    
  // Convert all sizes to standardized format
  processed = processed.replace(/(\d+)\s*(GB|TB|PB)/i, (_, num, unit) => {
    const number = parseInt(num);
    if (unit.toLowerCase() === 'tb') {
      return `${number}TB`;
    } else if (unit.toLowerCase() === 'pb') {
      return `${number * 1024}TB`;
    }
    return `${number}GB`;
  });
  
  // Add storage type if missing
  if (!processed.includes('SSD') && !processed.includes('HDD')) {
    processed += ' SSD';
  }
  
  return processed;
};

const processGraphics = (graphics: string | undefined): string | undefined => {
  if (!graphics) return undefined;
  
  return graphics
    .replace(/NVIDIA\s*GeForce\s*/i, '')
    .replace(/AMD\s*Radeon\s*/i, 'Radeon ')
    .replace(/Intel\s*(UHD|Iris)\s*/i, '$1 ')
    .replace(/\s*Graphics\s*/i, '')
    .replace(/\s*with\s*\d+GB\s*GDDR\d+/i, '')
    .trim();
};

const processScreenSize = (size: string | undefined): string | undefined => {
  if (!size) return undefined;
  
  // Extract numeric size and standardize format
  const match = size.match(/(\d+\.?\d*)\s*-?\s*inch/i);
  if (match) {
    return `${match[1]}"`;
  }
  
  return size.replace(/(\d+\.?\d*)\s*inch(es)?/i, '$1"').trim();
};

const processWeight = (weight: string | undefined): string | undefined => {
  if (!weight) return undefined;
  
  // Convert all weights to kg and standardize format
  return weight
    .replace(/(\d+\.?\d*)\s*(kg|pounds?|lbs?)/i, (_, num, unit) => {
      const number = parseFloat(num);
      if (unit.toLowerCase().startsWith('lb')) {
        return `${(number * 0.453592).toFixed(2)} kg`;
      }
      return `${number} kg`;
    })
    .trim();
};

const processBatteryLife = (battery: string | undefined): string | undefined => {
  if (!battery) return undefined;
  
  // Extract hours and standardize format
  const match = battery.match(/(\d+\.?\d*)\s*(hour|hr)/i);
  if (match) {
    return `${match[1]} hours`;
  }
  
  return battery
    .replace(/up\s*to\s*/i, '')
    .replace(/(\d+\.?\d*)\s*(hour|hr)s?/i, '$1 hours')
    .trim();
};

const processLaptopData = (laptop: Product): Product => {
  console.log('Processing laptop:', laptop.title);
  const processed = {
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
  console.log('Processed laptop:', processed);
  return processed;
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
