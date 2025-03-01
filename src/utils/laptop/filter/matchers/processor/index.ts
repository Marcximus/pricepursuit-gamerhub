
// Re-export all processor matchers from their respective files
export * from './appleProcessor';
export * from './amdProcessor';
export * from './otherProcessor';
// Export the main Intel processor matcher function and avoid re-exporting the individual matchers
export { matchesIntelProcessor } from './intel';
export * from './processorMatcherCore';
