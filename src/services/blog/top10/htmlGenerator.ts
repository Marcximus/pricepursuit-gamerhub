
/**
 * HTML generation utilities for Top10 blog posts
 */
import { generateProductHtml } from './generators/productGenerator';
import { addVideoEmbed } from './generators/videoEmbedder';
import { wrapTextInHtml } from './generators/htmlWrapper';

// Re-export the functions
export { generateProductHtml, addVideoEmbed, wrapTextInHtml };
