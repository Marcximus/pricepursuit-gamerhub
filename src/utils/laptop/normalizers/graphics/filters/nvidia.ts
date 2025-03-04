
import { extractModelNumber } from './common';

/**
 * NVIDIA-specific filter value extraction
 */
export const getNvidiaFilterValue = (normalized: string): string | null => {
  // RTX Series by model number
  if (/\brtx\s*40\d0/i.test(normalized)) {
    const model = extractModelNumber(normalized, /\brtx\s*(40\d0)/i);
    if (model) return `NVIDIA RTX ${model}`;
  }
  
  if (/\brtx\s*30\d0/i.test(normalized)) {
    const model = extractModelNumber(normalized, /\brtx\s*(30\d0)/i);
    if (model) return `NVIDIA RTX ${model}`;
  }
  
  if (/\brtx\s*20\d0/i.test(normalized)) {
    const model = extractModelNumber(normalized, /\brtx\s*(20\d0)/i);
    if (model) return `NVIDIA RTX ${model}`;
  }
  
  // GTX 10-series - Enhanced to specifically match GTX 1060, 1070, 1080
  if (/\bgtx\s*1060\b/i.test(normalized)) {
    return `NVIDIA GTX 1060`;
  }
  
  if (/\bgtx\s*1070\b/i.test(normalized)) {
    return `NVIDIA GTX 1070`;
  }
  
  if (/\bgtx\s*1080\b/i.test(normalized)) {
    return `NVIDIA GTX 1080`;
  }
  
  // GTX Series - Enhanced to specifically match GTX 1650
  if (/\bgtx\s*1650\b/i.test(normalized)) {
    return `NVIDIA GTX 1650`;
  }
  
  // GTX Series - Enhanced to specifically match GTX 1660
  if (/\bgtx\s*1660\b/i.test(normalized)) {
    return `NVIDIA GTX 1660`;
  }
  
  // Also match when the model numbers don't have spaces
  if (/\bgtx1060\b/i.test(normalized)) {
    return `NVIDIA GTX 1060`;
  }
  
  if (/\bgtx1070\b/i.test(normalized)) {
    return `NVIDIA GTX 1070`;
  }
  
  if (/\bgtx1080\b/i.test(normalized)) {
    return `NVIDIA GTX 1080`;
  }
  
  if (/\bgtx1650\b/i.test(normalized)) {
    return `NVIDIA GTX 1650`;
  }
  
  if (/\bgtx1660\b/i.test(normalized)) {
    return `NVIDIA GTX 1660`;
  }
  
  if (/\bgtx\s*16\d0/i.test(normalized)) {
    const model = extractModelNumber(normalized, /\bgtx\s*(16\d0)/i);
    if (model) return `NVIDIA GTX ${model}`;
  }
  
  if (/\bgtx\s*10\d0/i.test(normalized)) {
    const model = extractModelNumber(normalized, /\bgtx\s*(10\d0)/i);
    if (model) return `NVIDIA GTX ${model}`;
  }
  
  // NVIDIA MX Series
  if (/\bmx\s*\d{3}/i.test(normalized)) {
    const model = extractModelNumber(normalized, /\bmx\s*(\d{3})/i);
    if (model) return `NVIDIA MX ${model}`;
  }
  
  // Generic categories
  if (normalized.includes('nvidia') && normalized.includes('rtx')) {
    return 'NVIDIA RTX Graphics';
  }
  
  // Special case to catch GTX models that might be formatted differently
  if (normalized.includes('nvidia') && normalized.includes('gtx')) {
    if (normalized.includes('1060')) {
      return 'NVIDIA GTX 1060';
    }
    if (normalized.includes('1070')) {
      return 'NVIDIA GTX 1070';
    }
    if (normalized.includes('1080')) {
      return 'NVIDIA GTX 1080';
    }
    if (normalized.includes('1650')) {
      return 'NVIDIA GTX 1650';
    }
    if (normalized.includes('1660')) {
      return 'NVIDIA GTX 1660';
    }
    return 'NVIDIA GTX Graphics';
  }
  
  if (normalized.includes('nvidia')) {
    return 'NVIDIA Graphics';
  }
  
  return null;
};
