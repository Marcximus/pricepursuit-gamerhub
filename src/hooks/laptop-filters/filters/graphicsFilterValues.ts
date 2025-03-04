
import type { Product } from "@/types/product";
import { normalizeGraphics, getGraphicsFilterValue } from "@/utils/laptop/normalizers/graphicsNormalizer";

/**
 * Group graphics cards into meaningful categories for better filtering
 */
export const getGroupedGraphicsValues = (laptops: Product[], minCountForIndividualListing: number): Set<string> => {
  if (!laptops || laptops.length === 0) {
    return new Set<string>();
  }

  // Count occurrences of each graphics card type
  const graphicsCount: Record<string, number> = {};
  const graphicsMapping: Record<string, string> = {};
  
  // First pass: Count normalized graphics values
  laptops.forEach(laptop => {
    if (!laptop.graphics) return;
    
    // Normalize the graphics and get a category-based filter value for grouping
    const normalizedGraphics = normalizeGraphics(laptop.graphics);
    const filterValue = getGraphicsFilterValue(normalizedGraphics);
    
    if (filterValue) {
      graphicsCount[filterValue] = (graphicsCount[filterValue] || 0) + 1;
      
      // Map the original normalized value to its filter value for later lookup
      graphicsMapping[normalizedGraphics] = filterValue;
    }
  });

  // Define major graphics categories for grouping
  const graphicsCategories: Record<string, string[]> = {
    // NVIDIA RTX Series (newest to oldest)
    "NVIDIA RTX 40 Series": [
      "NVIDIA RTX 4090", "NVIDIA RTX 4080", "NVIDIA RTX 4070", "NVIDIA RTX 4060", "NVIDIA RTX 4050"
    ],
    "NVIDIA RTX 30 Series": [
      "NVIDIA RTX 3090", "NVIDIA RTX 3080", "NVIDIA RTX 3070", "NVIDIA RTX 3060", "NVIDIA RTX 3050"
    ],
    "NVIDIA RTX 20 Series": [
      "NVIDIA RTX 2080", "NVIDIA RTX 2070", "NVIDIA RTX 2060"
    ],
    
    // NVIDIA GTX Series
    "NVIDIA GTX Series": [
      "NVIDIA GTX 1660", "NVIDIA GTX 1650", "NVIDIA GTX 1080", "NVIDIA GTX 1070", "NVIDIA GTX 1060", "NVIDIA GTX 1050"
    ],
    
    // AMD Radeon Series
    "AMD Radeon RX 7000 Series": [
      "AMD Radeon RX 7900", "AMD Radeon RX 7800", "AMD Radeon RX 7700", "AMD Radeon RX 7600", "AMD Radeon RX 7500"
    ],
    "AMD Radeon RX 6000 Series": [
      "AMD Radeon RX 6900", "AMD Radeon RX 6800", "AMD Radeon RX 6700", "AMD Radeon RX 6600", "AMD Radeon RX 6500"
    ],
    "AMD Radeon Graphics": [
      "AMD Radeon Graphics", "AMD Radeon Vega"
    ],
    
    // Intel Graphics
    "Intel Integrated Graphics": [
      "Intel Iris Xe Graphics", "Intel Iris Graphics", "Intel UHD Graphics", "Intel HD Graphics"
    ],
    "Intel Arc Graphics": [
      "Intel Arc"
    ],
    
    // Apple Graphics
    "Apple Silicon Graphics": [
      "Apple M3", "Apple M2", "Apple M1"
    ],
    
    // Special categories
    "High Performance GPUs": [
      "High Performance GPU", "Dedicated GPU"
    ],
    "Integrated GPUs": [
      "Integrated GPU"
    ]
  };

  const finalGraphicsSet = new Set<string>();
  const processedValues = new Set<string>();
  
  // Add category groups first
  Object.entries(graphicsCategories).forEach(([category, specificValues]) => {
    let categoryHasItems = false;
    const matchingValues: string[] = [];
    
    // Check if any of the specific values in this category exist in our data
    Object.keys(graphicsCount).forEach(value => {
      // Find if the value matches or contains any of the specific values
      const matchesCategory = specificValues.some(specificValue => {
        const valueLC = value.toLowerCase();
        const specificLC = specificValue.toLowerCase();
        return valueLC.includes(specificLC) || (specificLC.includes(valueLC) && specificLC.length > 3);
      });
      
      if (matchesCategory) {
        categoryHasItems = true;
        matchingValues.push(value);
        processedValues.add(value);
      }
    });
    
    if (categoryHasItems) {
      finalGraphicsSet.add(category);
      
      // Add specific valuable models within the category that meet the minimum count
      matchingValues.forEach(value => {
        if (graphicsCount[value] >= minCountForIndividualListing) {
          finalGraphicsSet.add(value);
        }
      });
    }
  });
  
  // Add any remaining values with counts above the threshold
  Object.entries(graphicsCount)
    .filter(([value]) => !processedValues.has(value) && graphicsCount[value] >= minCountForIndividualListing)
    .forEach(([value]) => {
      finalGraphicsSet.add(value);
    });
  
  // Add general catch-all categories for any unprocessed items
  if (Array.from(processedValues).length < Object.keys(graphicsCount).length) {
    if (Object.keys(graphicsCount).some(value => value.toLowerCase().includes('nvidia') && !processedValues.has(value))) {
      finalGraphicsSet.add('Other NVIDIA Graphics');
    }
    if (Object.keys(graphicsCount).some(value => value.toLowerCase().includes('amd') && !processedValues.has(value))) {
      finalGraphicsSet.add('Other AMD Graphics');
    }
    if (Object.keys(graphicsCount).some(value => value.toLowerCase().includes('intel') && !processedValues.has(value))) {
      finalGraphicsSet.add('Other Intel Graphics');
    }
    
    // Add a general 'Other' category if needed
    finalGraphicsSet.add('Other Graphics');
  }

  // Log the final set for debugging
  console.log(`Grouped ${Object.keys(graphicsCount).length} graphics cards into ${finalGraphicsSet.size} filter options`);
  
  return finalGraphicsSet;
};
