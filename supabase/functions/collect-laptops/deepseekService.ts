
/**
 * This file is now a simple re-export of the refactored service
 * to maintain backward compatibility
 */
import { processWithDeepseek as processLaptopWithDeepseek } from './services/ai/index.ts';
import { OxylabsResult, ProcessedLaptopData } from './types.ts';

export async function processWithDeepseek(laptopData: OxylabsResult): Promise<ProcessedLaptopData> {
  return processLaptopWithDeepseek(laptopData);
}
