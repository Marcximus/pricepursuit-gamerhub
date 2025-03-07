
/**
 * Prompt management for different blog post types
 */
import { 
  getReviewPrompt, 
  getTop10Prompt, 
  getComparisonPrompt, 
  getHowToPrompt, 
  getDefaultPrompt 
} from './prompts/index.ts';

export type { BlogCategory } from './prompts/types.ts';

/**
 * Get the system prompt for the AI based on blog post category
 */
export function getSystemPrompt(
  category: string, 
  productData?: any, 
  secondProductData?: any, 
  amazonProducts?: any[]
): string {
  switch (category) {
    case 'Review':
      return getReviewPrompt(productData);
    case 'Top10':
      return getTop10Prompt(amazonProducts);
    case 'Comparison':
      return getComparisonPrompt(productData, secondProductData);
    case 'How-To':
      return getHowToPrompt();
    default:
      return getDefaultPrompt();
  }
}
