
export * from './brandProcessing';
export * from './pageProcessing';
export * from './productMatching';
export * from './specNormalization';

// Re-export the normalizers for backward compatibility
export { normalizeProductSpecs } from './specNormalization';
