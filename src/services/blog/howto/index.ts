
/**
 * Export function for processing How-To blog content
 */
// Export the main processing function
export { processHowToContent } from './processHowToContent';

// Export the prompt getter
export { getHowToPrompt } from './howToPrompt';

// Export utility functions
export { cleanupContent, fixHtmlTags, formatTables } from './contentProcessor';
export { addVideoEmbed, wrapTextInHtml } from './htmlGenerator';
