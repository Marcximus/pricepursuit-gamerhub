import { normalizeGraphics, getGraphicsFilterValue, isIntegratedGraphics, isHighPerformanceGraphics } from "@/utils/laptop/normalizers/graphicsNormalizer";
import { matchesNvidiaGraphics } from './nvidiaMatcher';
import { matchesAmdGraphics } from './amdMatcher';
import { matchesIntelGraphics } from './intelMatcher';
import { matchesAppleGraphics } from './appleMatcher';

/**
 * Enhanced matcher for graphics card filter values with improved accuracy
 * Now supports matching against grouped/category values
 */
export const matchesGraphicsFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Normalize both filter and product values for consistency
  const normalizedProduct = normalizeGraphics(productValue);
  
  // Skip matching if the normalized product value is excessively long (likely invalid)
  // or if it's empty after normalization
  if (normalizedProduct.length > 50 || normalizedProduct.length === 0) {
    return false;
  }
  
  // Get category-based filter values for better matching
  const productFilterValue = getGraphicsFilterValue(normalizedProduct);
  
  // Primary case: direct category match
  if (productFilterValue.toLowerCase() === filterValue.toLowerCase()) {
    return true;
  }
  
  // Special filter case: "High Performance GPU"
  if (filterValue === 'High Performance GPUs' && 
      isHighPerformanceGraphics(normalizedProduct)) {
    return true;
  }
  
  // Special filter case: "Integrated GPU"
  if (filterValue === 'Integrated GPUs' && 
      isIntegratedGraphics(normalizedProduct)) {
    return true;
  }
  
  // Special filter case: "Dedicated GPU"
  if (filterValue === 'High Performance GPUs' && 
      !isIntegratedGraphics(normalizedProduct)) {
    return true;
  }
  
  // Category matching for NVIDIA series
  if (filterValue === 'NVIDIA RTX 40 Series' && 
      /nvidia\s+rtx\s+40\d0/i.test(normalizedProduct)) {
    return true;
  }
  
  if (filterValue === 'NVIDIA RTX 30 Series' && 
      /nvidia\s+rtx\s+30\d0/i.test(normalizedProduct)) {
    return true;
  }
  
  if (filterValue === 'NVIDIA RTX 20 Series' && 
      /nvidia\s+rtx\s+20\d0/i.test(normalizedProduct)) {
    return true;
  }
  
  if (filterValue === 'NVIDIA GTX Series' && 
      /nvidia\s+gtx/i.test(normalizedProduct)) {
    return true;
  }
  
  // Category matching for AMD series
  if (filterValue === 'AMD Radeon RX 7000 Series' && 
      /amd\s+radeon\s+rx\s+7\d00/i.test(normalizedProduct)) {
    return true;
  }
  
  if (filterValue === 'AMD Radeon RX 6000 Series' && 
      /amd\s+radeon\s+rx\s+6\d00/i.test(normalizedProduct)) {
    return true;
  }
  
  if (filterValue === 'AMD Radeon Graphics' && 
      (/amd\s+radeon/i.test(normalizedProduct) && 
       !/amd\s+radeon\s+rx/i.test(normalizedProduct))) {
    return true;
  }
  
  // Category matching for Intel graphics
  if (filterValue === 'Intel Integrated Graphics' && 
      (/intel\s+(?:iris|uhd|hd)/i.test(normalizedProduct))) {
    return true;
  }
  
  if (filterValue === 'Intel Arc Graphics' && 
      /intel\s+arc/i.test(normalizedProduct)) {
    return true;
  }
  
  // Category matching for Apple Silicon
  if (filterValue === 'Apple Silicon Graphics' && 
      /apple\s+m[123]/i.test(normalizedProduct)) {
    return true;
  }
  
  // Other general categories
  if (filterValue === 'Other NVIDIA Graphics' && 
      /nvidia/i.test(normalizedProduct) && 
      !(/rtx|gtx/i.test(normalizedProduct))) {
    return true;
  }
  
  if (filterValue === 'Other AMD Graphics' && 
      /amd/i.test(normalizedProduct) && 
      !(/radeon/i.test(normalizedProduct))) {
    return true;
  }
  
  if (filterValue === 'Other Intel Graphics' && 
      /intel/i.test(normalizedProduct) && 
      !(/iris|uhd|hd|arc/i.test(normalizedProduct))) {
    return true;
  }
  
  if (filterValue === 'Other Graphics') {
    // Match anything that hasn't been categorized into the major brands
    return !(/nvidia|amd|intel|apple/i.test(normalizedProduct));
  }
  
  // Secondary case: more detailed checking based on GPU type
  const productLower = normalizedProduct.toLowerCase();
  const filterLower = filterValue.toLowerCase();
  
  // NVIDIA discrete GPU matching
  if ((filterLower.includes('rtx') || filterLower.includes('gtx') || filterLower.includes('nvidia')) &&
      (productLower.includes('rtx') || productLower.includes('gtx') || productLower.includes('nvidia'))) {
    return matchesNvidiaGraphics(filterLower, productLower);
  }
  
  // Intel graphics
  if (filterLower.includes('intel') && productLower.includes('intel')) {
    return matchesIntelGraphics(filterLower, productLower);
  }
  
  // AMD graphics
  if ((filterLower.includes('radeon') || filterLower.includes('amd') || filterLower.includes('vega')) && 
      (productLower.includes('radeon') || productLower.includes('amd') || productLower.includes('vega'))) {
    return matchesAmdGraphics(filterLower, productLower);
  }
  
  // Apple integrated graphics
  if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3') || 
      filterLower.includes('apple')) &&
      (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3') || 
      productLower.includes('apple'))) {
    return matchesAppleGraphics(filterLower, productLower);
  }
  
  // Match by major GPU brand terms
  const gpuBrands = ['nvidia', 'amd', 'radeon', 'intel', 'apple', 'rtx', 'gtx'];
  const sharesBrand = gpuBrands.some(brand => 
    filterLower.includes(brand) && productLower.includes(brand)
  );
  
  // If it shares a brand term and all filter words are in the product
  const filterWords = filterLower.split(/\s+/);
  return sharesBrand && filterWords.every(word => productLower.includes(word));
};
