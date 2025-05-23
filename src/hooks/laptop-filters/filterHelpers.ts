
import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";
import { 
  normalizeRam,
  normalizeStorage,
  normalizeScreenSize,
  normalizeGraphics,
  normalizeProcessor,
  normalizeBrand,
} from "@/utils/laptop/valueNormalizer";
import { getRamValue, getStorageValue, getScreenSizeValue } from "@/utils/laptop/valueParser";

/**
 * Generic utility to get valid values for a specific laptop property
 */
export const getValidValues = (
  laptops: Product[], 
  key: FilterableProductKeys,
  normalizer: (value: string) => string,
  validator?: (value: string) => boolean
): string[] => {
  const validValues = laptops
    .map(laptop => {
      const value = laptop[key];
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return null;
      }

      const normalized = normalizer(value);
      
      // Skip if normalized value is empty or doesn't pass validation
      if (!normalized || (validator && !validator(normalized))) {
        return null;
      }
      
      return normalized;
    })
    .filter((value): value is string => value !== null && value !== '');

  // Return unique values
  return Array.from(new Set(validValues));
};

/**
 * Validates RAM values, excluding unrealistic values
 */
export const validateRam = (value: string): boolean => {
  const ramGB = getRamValue(value);
  return ramGB >= 4 && ramGB <= 128;
};

/**
 * Validates storage values, excluding unrealistic values
 */
export const validateStorage = (value: string): boolean => {
  const storageGB = getStorageValue(value);
  return storageGB >= 128;
};

/**
 * Validates screen size values, excluding unrealistic values
 */
export const validateScreenSize = (value: string): boolean => {
  const sizeInches = getScreenSizeValue(value);
  return sizeInches >= 10 && sizeInches <= 21;
};

/**
 * Validates graphics card values, excluding generic or nonsensical values
 */
export const validateGraphics = (value: string): boolean => {
  return value.length >= 3 &&
         value !== 'integrated' && 
         value !== 'dedicated' &&
         value !== 'GPU' &&
         !value.includes('32-core');
};

/**
 * Validates processor values, excluding generic values
 */
export const validateProcessor = (value: string): boolean => {
  return value.length >= 3 && 
         value !== 'CPU' && 
         value !== 'Processor';
};

/**
 * Validates brand values, excluding clearly incorrect brand values
 */
export const validateBrand = (value: string): boolean => {
  return value !== 'Unknown Brand' && 
         !value.toLowerCase().includes('series') &&
         value.length >= 2;
};

/**
 * Mapping of filter keys to their validation functions
 */
export const validatorMap = {
  'ram': validateRam,
  'storage': validateStorage,
  'screen_size': validateScreenSize,
  'graphics': validateGraphics,
  'processor': validateProcessor,
  'brand': validateBrand
};

/**
 * Mapping of filter keys to their normalization functions
 */
export const normalizerMap = {
  'ram': normalizeRam,
  'storage': normalizeStorage,
  'screen_size': normalizeScreenSize,
  'graphics': normalizeGraphics,
  'processor': normalizeProcessor,
  'brand': normalizeBrand
};
