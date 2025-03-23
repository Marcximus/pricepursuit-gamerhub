
import type { Product } from "@/types/product";

/**
 * Formats a laptop title for display in a consistent way
 */
export function formatLaptopDisplayTitle(laptop: Product | null): string {
  if (!laptop) return "Unknown Laptop";
  
  if (laptop.brand && laptop.model) {
    return `${laptop.brand} ${laptop.model}`;
  }
  
  if (laptop.title) {
    // Extract first 3-4 words from title as a simplified display name
    const words = laptop.title.split(' ');
    const shortTitle = words.slice(0, 4).join(' ');
    
    return shortTitle.length < 30 ? shortTitle : shortTitle.substring(0, 27) + '...';
  }
  
  return laptop.asin || "Unknown Laptop";
}
