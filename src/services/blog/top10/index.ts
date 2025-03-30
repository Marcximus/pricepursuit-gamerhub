
/**
 * Top10 blog post processing module
 */
import { processTop10Content } from './processTop10Content';
import { 
  cleanupContent, 
  fixHtmlTags, 
  removeJsonFormatting 
} from './contentProcessor';
import { 
  replaceProductPlaceholders, 
  removeDuplicateProductBlocks 
} from './product/productPlacer';
import { getProducts } from './productHandler';
import { 
  formatAmazonUrl, 
  generateStarsHtml, 
  formatPrice, 
  showErrorToast,
  generateAffiliateButtonHtml,
  generateStars
} from './utils';
import { generateProductHtml, addVideoEmbed, wrapTextInHtml } from './htmlGenerator';

export {
  processTop10Content,
  cleanupContent,
  fixHtmlTags,
  removeJsonFormatting,
  replaceProductPlaceholders,
  removeDuplicateProductBlocks,
  getProducts,
  showErrorToast,
  formatAmazonUrl,
  generateStars,
  formatPrice,
  generateStarsHtml,
  generateAffiliateButtonHtml,
  generateProductHtml,
  addVideoEmbed,
  wrapTextInHtml
};
