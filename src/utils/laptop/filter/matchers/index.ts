
// Export all matchers from their respective files
export { matchesBrandFilter } from './brandMatcher';
export { matchesGraphicsFilter } from './graphicsMatcher';
export { matchesProcessorFilter } from './processorMatcher';
export { matchesRamFilter } from './ramMatcher';
export { matchesScreenSizeFilter } from './screenSizeMatcher';
export { matchesStorageFilter } from './storageMatcher';

// Export utility functions from commonMatchers
export { parseValueWithUnit, matchesFilter } from './commonMatchers';
