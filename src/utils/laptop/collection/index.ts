
// Export all functionality from collection modules
export * from './statusManagement';
export * from './pageProcessing';
export * from './productMatching';
export * from './specNormalization';
export * from './brandProcessing';

// Re-export the normalizers for backward compatibility
export { normalizeProductSpecs } from './specNormalization';
