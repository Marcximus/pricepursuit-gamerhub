
/**
 * HTML generation utilities for Top10 blog posts
 */
import { generateProductHtml } from './generators/productGenerator';
import { addVideoEmbed as addVideoEmbedImpl } from './generators/videoEmbedder';
import { wrapTextInHtml as wrapTextInHtmlImpl } from './generators/htmlWrapper';

// Re-export the functions
export const generateProductHtml = generateProductHtml;
export const addVideoEmbed = addVideoEmbedImpl;
export const wrapTextInHtml = wrapTextInHtmlImpl;
