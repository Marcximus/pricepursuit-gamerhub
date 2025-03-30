
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
  
  // Capitalize first letter of each word
  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
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
  
  // Determine sort strategy based on the presence of "best" in the title or prompt
  let sortBy = 'RELEVANCE';
  if (promptLower.includes('best') || title.toLowerCase().includes('best')) {
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
  
  // Log extraction results for debugging
  console.log('📊 Extracted search parameters:', {
    query: query.trim(),
    brand,
    maxPrice,
    category,
    sortBy,
    title
  });
  
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

// Implement the fetchAmazonProducts function
export async function fetchAmazonProducts(params: SearchParam | ExtractedParams): Promise<any[]> {
  // Normalize the parameters to ensure we're working with SearchParam type
  const searchParams = 'searchParams' in params ? params.searchParams : params;
  
  console.log('🔍 Fetching Amazon products with parameters:', searchParams);
  
  try {
    // Update to use the Supabase edge function directly
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('📡 Calling fetch-amazon-products edge function...');
    const response = await supabase.functions.invoke('fetch-amazon-products', {
      method: 'POST',
      body: searchParams,
    });
    
    if (response.error) {
      console.error('❌ Error fetching Amazon products:', response.error);
      throw new Error(`Error from edge function: ${response.error.message || 'Unknown error'}`);
    }
    
    const data = response.data;
    console.log('📦 Raw response from fetch-amazon-products:', data);
    
    if (!data || !Array.isArray(data.products)) {
      console.error('❌ Invalid response format from Amazon API:', data);
      throw new Error('Invalid response format from Amazon API');
    }
    
    console.log(`✅ Successfully fetched ${data.products.length || 0} products`);
    
    // Log a sample of the first product to verify data structure
    if (data.products.length > 0) {
      console.log('📝 First product sample (title, asin):', {
        title: data.products[0].title,
        asin: data.products[0].asin
      });
    }
    
    return data.products || [];
  } catch (error) {
    console.error('💥 Exception during Amazon products fetch:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Return empty array instead of rethrowing to prevent blocking the entire blog post generation
    return [];
  }
}
