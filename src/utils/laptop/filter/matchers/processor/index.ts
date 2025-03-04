
/**
 * Processor matcher index module
 * Exports all processor matcher functionality
 */

// Export the main processor matcher for backward compatibility
export { matchesProcessorFilter } from './core/processorMatcher';

// Export individual matchers
export { matchesAppleProcessor } from './appleProcessor';
export { matchesAmdProcessor } from './amdProcessor';
export { matchesIntelProcessor } from './intel/intelCore';
export { matchesOtherProcessor } from './otherProcessor';

// These exports are causing conflicts, so I'm removing the direct exports
// and only exporting them through their respective modules
// The functions will still be available through the modules that already export them
