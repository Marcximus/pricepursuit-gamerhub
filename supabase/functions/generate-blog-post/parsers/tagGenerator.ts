
/**
 * Tag generation utilities for blog content
 */

/**
 * Generate tags from content for SEO purposes
 */
export function generateTagsFromContent(title: string, content: string, category: string): string[] {
  const defaultTags: Record<string, string[]> = {
    'Review': ['review', 'laptop', 'tech'],
    'Comparison': ['comparison', 'versus', 'laptops'],
    'Top10': ['best laptops', 'top 10', 'recommendations'],
    'How-To': ['how-to', 'tutorial', 'guide']
  };
  
  // Start with category-specific default tags
  const tags = [...defaultTags[category] || ['tech', 'laptops']];
  
  // Extract potential keywords from title
  const titleWords = title.toLowerCase().split(/\s+/);
  const brandKeywords = ['lenovo', 'hp', 'dell', 'asus', 'acer', 'microsoft', 'apple', 'msi', 'alienware', 'razer'];
  const typeKeywords = ['gaming', 'business', 'student', 'budget', 'premium', 'ultrabook', 'convertible', 'detachable'];
  
  // Add brand if found in title
  for (const brand of brandKeywords) {
    if (titleWords.includes(brand)) {
      tags.push(brand);
      tags.push(`${brand} laptop`);
      break;
    }
  }
  
  // Add laptop type if found in title
  for (const type of typeKeywords) {
    if (titleWords.includes(type)) {
      tags.push(type);
      tags.push(`${type} laptop`);
      break;
    }
  }
  
  // Limit to 10 unique tags
  return [...new Set(tags)].slice(0, 10);
}
