
/**
 * Processor matcher index module
 * Exports all processor matcher functionality
 */

// Export the main processor matcher for backward compatibility
export * from './processorMatcherCore';

// Export individual matchers
export * from './appleProcessor';
export * from './amdProcessor';
export * from './intel/intelCore';
export * from './otherProcessor';

// Export Intel-specific matchers
export * from './intel/intelCoreI';
export * from './intel/intelCoreUltra';
export * from './intel/intelBudget';
