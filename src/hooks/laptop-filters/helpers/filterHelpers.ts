
import type { FilterableProductKeys } from "@/utils/laptop/filter";
import { 
  normalizeRam,
  normalizeStorage,
  normalizeScreenSize,
  normalizeGraphics,
  normalizeProcessor,
  normalizeBrand,
} from "@/utils/laptop/valueNormalizer";

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
  // Lower threshold to 80GB to potentially catch more laptops
  return storageGB >= 80;
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

// Import these functions from the parser utilities
import { getRamValue, getStorageValue, getScreenSizeValue } from "@/utils/laptop/parsers";
