
// Export all functionality from collection modules
export * from './statusManagement';
// Export pageProcessing without shouldCollectProduct to avoid conflict
export { default as processPage } from './pageProcessing';
export * from './productMatching';
export * from './specNormalization';
export * from './brandProcessing';

// Re-export the normalizers for backward compatibility
export { normalizeProductSpecs } from './specNormalization';
