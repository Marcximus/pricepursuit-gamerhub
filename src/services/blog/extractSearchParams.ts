
import { SearchParam } from './types';

export function extractSearchParams(prompt: string): SearchParam[] {
  console.log('🔍 Extracting search parameters from prompt');
  console.log(`📝 Full prompt for extraction: "${prompt}"`);
  
  // Default search parameter
  const defaultParam: SearchParam = {};
  
  // Try to extract brand information
  const brandMatches = prompt.match(/\b(lenovo|hp|dell|asus|acer|apple|msi|alienware|razer|microsoft|samsung|gigabyte|lg)\b/gi);
  if (brandMatches && brandMatches.length > 0) {
    defaultParam.brand = brandMatches[0];
    console.log(`👔 Found brand: ${defaultParam.brand}`);
  } else {
    console.log('👔 No specific brand found in prompt');
  }
  
  // Try to extract processor information
  if (prompt.match(/\b(gaming|game|gamer)\b/i)) {
    defaultParam.processor = 'i7';
    defaultParam.graphics = 'RTX';
    console.log('🎮 Gaming keywords detected, added i7 processor and RTX graphics');
  } else if (prompt.match(/\b(budget|cheap|affordable|under\s*\$\s*800)\b/i)) {
    defaultParam.maxPrice = 800;
    console.log('💰 Budget keywords detected, set maxPrice to $800');
  } else if (prompt.match(/\b(professional|work|business)\b/i)) {
    defaultParam.processor = 'i5';
    console.log('💼 Professional keywords detected, added i5 processor');
  } else {
    console.log('🔍 No specific usage pattern detected in prompt');
  }
  
  // Extract price ranges
  const priceMatches = prompt.match(/\b(under|below)\s*\$\s*(\d+)/i);
  if (priceMatches && priceMatches[2]) {
    defaultParam.maxPrice = parseInt(priceMatches[2]);
    console.log(`💲 Price limit found: $${defaultParam.maxPrice}`);
  }
  
  const priceRangeMatches = prompt.match(/\$\s*(\d+)\s*-\s*\$\s*(\d+)/);
  if (priceRangeMatches && priceRangeMatches[1] && priceRangeMatches[2]) {
    defaultParam.minPrice = parseInt(priceRangeMatches[1]);
    defaultParam.maxPrice = parseInt(priceRangeMatches[2]);
    console.log(`💲 Price range found: $${defaultParam.minPrice} - $${defaultParam.maxPrice}`);
  }
  
  // If no parameters were extracted, return a default set
  if (Object.keys(defaultParam).length === 0) {
    console.log('⚠️ No specific parameters found in prompt, using default brand set');
    const defaultParams = [
      { brand: 'Lenovo' },
      { brand: 'HP' },
      { brand: 'Dell' },
      { brand: 'ASUS' },
      { brand: 'Acer' }
    ];
    console.log(`🔄 Returning ${defaultParams.length} default brand parameters:`, JSON.stringify(defaultParams, null, 2));
    return defaultParams;
  }
  
  console.log(`✅ Extracted search parameters from prompt:`, JSON.stringify(defaultParam, null, 2));
  return [defaultParam];
}
