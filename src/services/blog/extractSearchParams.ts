
import { SearchParam } from './types';

export function extractSearchParams(prompt: string): SearchParam[] {
  // Default search parameter
  const defaultParam: SearchParam = {};
  
  // Try to extract brand information
  const brandMatches = prompt.match(/\b(lenovo|hp|dell|asus|acer|apple|msi|alienware|razer|microsoft|samsung|gigabyte|lg)\b/gi);
  if (brandMatches && brandMatches.length > 0) {
    defaultParam.brand = brandMatches[0];
  }
  
  // Try to extract processor information
  if (prompt.match(/\b(gaming|game|gamer)\b/i)) {
    defaultParam.processor = 'i7';
    defaultParam.graphics = 'RTX';
  } else if (prompt.match(/\b(budget|cheap|affordable|under\s*\$\s*800)\b/i)) {
    defaultParam.maxPrice = 800;
  } else if (prompt.match(/\b(professional|work|business)\b/i)) {
    defaultParam.processor = 'i5';
  }
  
  // Extract price ranges
  const priceMatches = prompt.match(/\b(under|below)\s*\$\s*(\d+)/i);
  if (priceMatches && priceMatches[2]) {
    defaultParam.maxPrice = parseInt(priceMatches[2]);
  }
  
  const priceRangeMatches = prompt.match(/\$\s*(\d+)\s*-\s*\$\s*(\d+)/);
  if (priceRangeMatches && priceRangeMatches[1] && priceRangeMatches[2]) {
    defaultParam.minPrice = parseInt(priceRangeMatches[1]);
    defaultParam.maxPrice = parseInt(priceRangeMatches[2]);
  }
  
  // If no parameters were extracted, return a default set
  if (Object.keys(defaultParam).length === 0) {
    return [
      { brand: 'Lenovo' },
      { brand: 'HP' },
      { brand: 'Dell' },
      { brand: 'ASUS' },
      { brand: 'Acer' }
    ];
  }
  
  return [defaultParam];
}
