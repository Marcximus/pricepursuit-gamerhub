
export interface SearchParam {
  query: string;
  brand?: string;
  maxPrice?: number;
  category?: string;
  sortBy?: string;
}

export interface ExtractedParams {
  searchParams: SearchParam;
  title: string;
}

export function extractSearchParamsFromPrompt(prompt: string): ExtractedParams {
  const promptLower = prompt.toLowerCase();
  
  // Extract potential title components
  const titleMatch = prompt.match(/(?:write about|create|make|generate|do)?\s*(?:a post about|an article about|a blog about|about)?\s*(top\s*10.*?)(?:\.|\?|$)/i);
  let title = titleMatch ? titleMatch[1].trim() : '';
  
  // Capitalize first letter of each word and add year if not present
  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  if (!title.includes('2024')) {
    title += ' in 2024';
  }
  
  // If title doesn't start with "Top 10", add it
  if (!title.toLowerCase().startsWith('top 10')) {
    title = 'Top 10 ' + title;
  }
  
  // Add "Best" if not present
  if (!title.toLowerCase().includes('best')) {
    title = title.replace('Top 10', 'Top 10 Best');
  }
  
  // Extract brand
  const brandMatches = promptLower.match(/\b(lenovo|dell|hp|asus|acer|msi|apple|samsung|microsoft|razer|toshiba|lg)\b/i);
  const brand = brandMatches ? brandMatches[1].toUpperCase() : undefined;
  
  // Extract price range
  const priceMatch = promptLower.match(/under\s*\$?(\d+)/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1]) : undefined;
  
  // Extract purpose/category
  const categoryMatches = {
    gaming: /\b(gaming|games|gamer)\b/i,
    business: /\b(business|work|professional|office)\b/i,
    student: /\b(student|school|college|university)\b/i,
    budget: /\b(budget|cheap|affordable|inexpensive)\b/i,
  };
  
  let category = undefined;
  for (const [key, regex] of Object.entries(categoryMatches)) {
    if (regex.test(promptLower)) {
      category = key;
      break;
    }
  }
  
  // Determine sort strategy
  let sortBy = 'RELEVANCE';
  if (promptLower.includes('best seller') || promptLower.includes('bestseller')) {
    sortBy = 'BEST_SELLERS';
  } else if (promptLower.includes('newest') || promptLower.includes('latest')) {
    sortBy = 'NEWEST_ARRIVALS';
  }
  
  // Build the query
  let query = '';
  if (brand) {
    query += brand + ' ';
  }
  query += 'laptop';
  if (category === 'gaming') {
    query += ' gaming';
  }
  
  return {
    searchParams: {
      query: query.trim(),
      brand: brand,
      maxPrice,
      category,
      sortBy
    },
    title
  };
}
