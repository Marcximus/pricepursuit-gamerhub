
// Re-export functions from the modular structure
// for backward compatibility

// Export top10 and other modules
export * from './top10';
export * from './uploadBlogImage';
export * from './generate';
export * from './ensureBlogBucket';

// Explicitly re-export from howto to avoid naming conflicts
export { processHowToContent, getHowToPrompt } from './howto';
// Do not re-export the utility functions that are causing conflicts
// as they are meant to be internal to the how-to module
