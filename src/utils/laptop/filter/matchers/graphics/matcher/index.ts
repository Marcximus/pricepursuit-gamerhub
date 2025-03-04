
/**
 * Exports all the specialized matcher functions for each GPU vendor
 */
export { matchesNvidiaGraphics } from './nvidia';
export { matchesAmdGraphics } from './amd';
export { matchesIntelGraphics } from './intel';
export { matchesAppleGraphics } from './apple';
export { matchesGenericGPU } from './generic';
export { matchesOtherGraphics } from './other';
