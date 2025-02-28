import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

export async function getLaptopsToUpdate(supabaseUrl: string, supabaseKey: string, batchSize: number) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: laptops, error: fetchError } = await supabase
    .from('products')
    .select('id, asin')
    .eq('is_laptop', true)
    .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'')
    .order('last_checked', { ascending: true })
    .limit(batchSize);

  if (fetchError) {
    throw new Error(`Failed to fetch laptops: ${fetchError.message}`);
  }

  return laptops;
}

export async function updateLaptopStatus(supabaseUrl: string, supabaseKey: string, laptopIds: string[], status: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from('products')
    .update({ update_status: status })
    .in('id', laptopIds);

  if (error) {
    throw new Error(`Failed to update laptop status: ${error.message}`);
  }
}

export async function updateLaptopData(
  supabaseUrl: string, 
  supabaseKey: string, 
  laptopId: string, 
  data: any, 
  status: string
) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from('products')
    .update({
      ...data,
      last_checked: new Date().toISOString(),
      update_status: status
    })
    .eq('id', laptopId);

  if (error) {
    throw new Error(`Failed to update laptop data: ${error.message}`);
  }
}

/**
 * Helper for checking if title contains forbidden keywords
 */
export const hasForbiddenKeywords = (title: string, forbiddenKeywords: string[]): boolean => {
  if (!title) return false;
  
  const normalizedTitle = title.toLowerCase();
  
  return forbiddenKeywords.some(keyword => 
    normalizedTitle.includes(keyword.toLowerCase())
  );
};

// Add this to your existing databaseService file
export const FORBIDDEN_PRODUCT_KEYWORDS = [
  "Charger Block", "Battery Replacement", "Replacement Laptop", "Stylus", "Mouse",
  "Messenger Case", "Protective Case", "Protective Sleeve", "Laptop Battery",
  "Laptop Charger", "Car Jump", "Headset", "Laptop Skin", "Charger Fit For",
  "Adapter Laptop Charger", "Mouse Pro", "Charger fit", "Charger for", "Bag",
  "External Hard Drive", "Power Adapter", "Mouse", "Jump Starter", "Battery Jump",
  "Headset", "Laptop Stand", "Magic Keyboard", "Laptop Super Charger", "Backpack",
  "Cooling pad", "External Enclosure", "Display Panel", "Cable for", "Surface dock",
  "Surface docking", "Screen Extender", "Earbuds", "Screen Replacement", "dock triple",
  "Bagpacks", "Bagoack", "Memory kit", "Soundbar", "Laptop AC Adapter",
  "Cooling fan replacement", "Laptop Bottom Base Case", "CPU FAN", "Replacement Keyboards",
  "Car Charger", "Adapter", "PIN LCD Display", "Power Cord Cable", "Charging Cable",
  "Laptop Charger", "Hoodies", "Protector Cover", "Women's", "Women", "Pad Protector",
  "Feet Replacement", "Charger for", "Sync Cable", "Insulation Wrapping", 
  "Replacement Memory Ram", "Cord Cable", "Screen Protector", "Charging Adapter",
  "Jack Connector", "Adapter Charger", "Wireless Mouse", "Rubber Feet Replacement",
  "PortChanger", "Touchpad protector", "Touch pad protector", "Touch pad film protector",
  "Charger Replacement", "Rubber Feet", "Laptop Sleeve", "Over-ear", "Laptop Charger",
  "New 90%", "Portable DVD Writer"
];
