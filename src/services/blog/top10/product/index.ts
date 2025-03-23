
/**
 * Product placement module for Top10 blog posts
 */
import { replaceProductPlaceholders, removeDuplicateProductBlocks } from './productPlacer';
import { replaceExplicitPlaceholders } from './strategies/explicitPlaceholders';
import { insertAfterHeadings } from './strategies/headingStrategy';
import { insertStrategically } from './strategies/strategicPlacement';
import { 
  fixProductNumbering, 
  cleanupDuplicateContent, 
  ensureConsistentProductLinks 
} from './utils/productContentUtils';

export {
  replaceProductPlaceholders,
  removeDuplicateProductBlocks,
  replaceExplicitPlaceholders,
  insertAfterHeadings,
  insertStrategically,
  fixProductNumbering,
  cleanupDuplicateContent,
  ensureConsistentProductLinks
};
