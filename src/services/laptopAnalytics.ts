
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";

export function logDataStatistics(laptops: any[]) {
  const withPrice = laptops.filter(l => l.current_price !== null && l.current_price > 0).length;
  const withProcessor = laptops.filter(l => l.processor !== null && l.processor !== '').length;
  const withRAM = laptops.filter(l => l.ram !== null && l.ram !== '').length;
  const withStorage = laptops.filter(l => l.storage !== null && l.storage !== '').length;
  const withGraphics = laptops.filter(l => l.graphics !== null && l.graphics !== '').length;
  const withScreenSize = laptops.filter(l => l.screen_size !== null && l.screen_size !== '').length;
  
  console.log('Laptop data statistics:', {
    total: laptops.length,
    withPrice: `${withPrice} (${Math.round(withPrice/laptops.length*100)}%)`,
    withProcessor: `${withProcessor} (${Math.round(withProcessor/laptops.length*100)}%)`,
    withRAM: `${withRAM} (${Math.round(withRAM/laptops.length*100)}%)`,
    withStorage: `${withStorage} (${Math.round(withStorage/laptops.length*100)}%)`,
    withGraphics: `${withGraphics} (${Math.round(withGraphics/laptops.length*100)}%)`,
    withScreenSize: `${withScreenSize} (${Math.round(withScreenSize/laptops.length*100)}%)`
  });
}

export function analyzeFilteredResults(
  original: Product[], 
  filtered: Product[], 
  filters: FilterOptions,
  sortBy: SortOption
) {
  if (filtered.length === 0 && original.length > 0) {
    console.warn('No laptops matched the filters! Analyzing first few original items:');
    
    original.slice(0, 3).forEach(laptop => {
      console.log('Analyzing why this laptop was filtered out:', {
        id: laptop.id,
        title: laptop.title,
        price: laptop.current_price,
        brand: laptop.brand,
        processor: laptop.processor,
        ram: laptop.ram,
        storage: laptop.storage,
        graphics: laptop.graphics,
        screen_size: laptop.screen_size
      });
      
      if (filters.brands.size > 0) {
        console.log(`- Brand filter (${Array.from(filters.brands).join(', ')}): ${laptop.brand ? 'Has brand' : 'Missing brand'} - ${filters.brands.has(laptop.brand || '') ? 'MATCH' : 'NO MATCH'}`);
      }
      
      if (filters.processors.size > 0) {
        console.log(`- Processor filter (${Array.from(filters.processors).join(', ')}): ${laptop.processor || 'Missing'} - NO MATCH`);
      }
      
      if (filters.ramSizes.size > 0) {
        console.log(`- RAM filter (${Array.from(filters.ramSizes).join(', ')}): ${laptop.ram || 'Missing'} - NO MATCH`);
      }
      
      if (filters.storageOptions.size > 0) {
        console.log(`- Storage filter (${Array.from(filters.storageOptions).join(', ')}): ${laptop.storage || 'Missing'} - NO MATCH`);
      }
      
      if (filters.graphicsCards.size > 0) {
        console.log(`- Graphics filter (${Array.from(filters.graphicsCards).join(', ')}): ${laptop.graphics || 'Missing'} - NO MATCH`);
      }
      
      if (filters.screenSizes.size > 0) {
        console.log(`- Screen size filter (${Array.from(filters.screenSizes).join(', ')}): ${laptop.screen_size || 'Missing'} - NO MATCH`);
      }
      
      const price = laptop.current_price || 0;
      console.log(`- Price filter (${filters.priceRange.min}-${filters.priceRange.max}): ${price} - ${price >= filters.priceRange.min && price <= filters.priceRange.max ? 'MATCH' : 'NO MATCH'}`);
    });
  }
}
