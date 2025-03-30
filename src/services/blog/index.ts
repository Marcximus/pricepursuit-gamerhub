import { generateBlogPost } from './generate';
import { uploadBlogImage } from './uploadBlogImage';
import { ensureBlogBucket } from './ensureBlogBucket';
import { GeneratedBlogContent, SearchParam } from './types';
import { fetchAmazonProducts, extractSearchParamsFromPrompt } from './amazonProductService';

export {
  generateBlogPost,
  uploadBlogImage,
  ensureBlogBucket,
  fetchAmazonProducts,
  extractSearchParamsFromPrompt,
  type GeneratedBlogContent,
  type SearchParam
};
