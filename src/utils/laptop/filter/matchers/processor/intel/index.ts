
/**
 * Intel processor matchers module
 * Consolidates all Intel processor matching functionality
 */
// Export only the main Intel processor matcher function
export { matchesIntelProcessor } from './intelCore';

// Do not re-export the individual matcher functions since they're already used
// internally by matchesIntelProcessor
