
// Export all matchers from their respective files
export { matchesBrandFilter } from './brandMatcher';
export { matchesGraphicsFilter } from './graphics/graphicsMatcherCore';
export { matchesProcessorFilter } from './processor/processorMatcherCore';
export { matchesRamFilter } from './ramMatcher';
export { matchesScreenSizeFilter } from './screenSizeMatcher';
export { matchesStorageFilter } from './storageMatcher';

// Export utility functions from commonMatchers
export { parseValueWithUnit, matchesFilter } from './commonMatchers';
