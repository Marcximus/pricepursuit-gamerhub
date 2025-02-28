
export * from './brandProcessing';
export * from './pageProcessing';
export * from './productMatching';
export * from './specNormalization';
export * from './progressTracking';
export * from './statusManagement';
export * from './dataProcessing';

// Re-export the normalizers for backward compatibility
export { normalizeProductSpecs } from './specNormalization';
