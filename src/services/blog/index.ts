
import { generateBlogPost } from './generateBlogPost';
import { uploadBlogImage } from './uploadBlogImage';
import { GeneratedBlogContent, SearchParam } from './types';
import { fetchAmazonProducts, extractSearchParamsFromPrompt } from './amazonProductService';
import { ensureBlogAssetsBucket } from './ensureStorageBucket';

export {
  generateBlogPost,
  uploadBlogImage,
  fetchAmazonProducts,
  extractSearchParamsFromPrompt,
  ensureBlogAssetsBucket,
  type GeneratedBlogContent,
  type SearchParam
};
