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
  
  // Extract brand with improved matching and normalization
  const commonBrands = [
    'alienware', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'apple', 
    'samsung', 'microsoft', 'razer', 'toshiba', 'lg', 'gigabyte', 'huawei', 
    'xiaomi', 'gateway', 'chuwi', 'medion'
  ];
  
  // First, look for exact brand matches with word boundaries
  let brand = null;
  for (const commonBrand of commonBrands) {
    const regex = new RegExp(`\\b${commonBrand}\\b`, 'i');
    if (regex.test(promptLower)) {
      // Format brand name properly
      if (commonBrand === 'hp') {
        brand = 'HP';
      } else if (commonBrand === 'lg') {
        brand = 'LG';
      } else if (commonBrand === 'msi') {
        brand = 'MSI';
      } else if (commonBrand === 'asus') {
        brand = 'ASUS';
      } else if (commonBrand === 'chuwi') {
        brand = 'CHUWI';
      } else {
        brand = commonBrand.charAt(0).toUpperCase() + commonBrand.slice(1);
      }
      break;
    }
  }
  
  // If no brand found in direct match, try to extract from the title
  if (!brand && title) {
    const titleWords = title.toLowerCase().split(' ');
    for (const commonBrand of commonBrands) {
      if (titleWords.includes(commonBrand)) {
        if (commonBrand === 'hp') {
          brand = 'HP';
        } else if (commonBrand === 'lg') {
          brand = 'LG';
        } else if (commonBrand === 'msi') {
          brand = 'MSI';
        } else if (commonBrand === 'asus') {
          brand = 'ASUS';
        } else if (commonBrand === 'chuwi') {
          brand = 'CHUWI';
        } else {
          brand = commonBrand.charAt(0).toUpperCase() + commonBrand.slice(1);
        }
        break;
      }
    }
  }
  
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
  
  // Build the query, with brand as the primary focus if specified
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
    
    // If a specific brand was requested, filter the results to only include that brand
    let filteredProducts = data.products || [];
    if (searchParams.brand) {
      const targetBrand = searchParams.brand.toLowerCase();
      console.log(`🔍 Filtering products for brand: ${targetBrand}`);
      
      // First try to find exact brand matches
      const exactMatches = filteredProducts.filter(product => {
        const productBrand = (product.brand || '').toLowerCase();
        return productBrand === targetBrand;
      });
      
      // If we have enough exact matches, use those
      if (exactMatches.length >= 5) {
        filteredProducts = exactMatches;
        console.log(`✅ Found ${exactMatches.length} exact brand matches for ${targetBrand}`);
      } else {
        // Otherwise, try broader matching including the title
        filteredProducts = filteredProducts.filter(product => {
          const productBrand = (product.brand || '').toLowerCase();
          const productTitle = (product.title || '').toLowerCase();
          
          return productBrand === targetBrand || 
                 productTitle.includes(targetBrand) || 
                 (targetBrand === 'alienware' && productTitle.includes('alien'));
        });
        
        console.log(`✅ Found ${filteredProducts.length} brand matches for ${targetBrand} after title search`);
      }
      
      // If we still don't have enough products, fall back to the original results
      if (filteredProducts.length < 3) {
        console.warn(`⚠️ Not enough ${targetBrand} products found (${filteredProducts.length}). Using unfiltered results.`);
        filteredProducts = data.products;
      }
    }
    
    console.log(`✅ Successfully fetched ${filteredProducts.length || 0} products`);
    
    // Log a sample of the first product to verify data structure
    if (filteredProducts.length > 0) {
      console.log('📝 First product sample (title, brand, asin):', {
        title: filteredProducts[0].title,
        brand: filteredProducts[0].brand,
        asin: filteredProducts[0].asin
      });
    }
    
    return filteredProducts || [];
  } catch (error) {
    console.error('💥 Exception during Amazon products fetch:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Return empty array instead of rethrowing to prevent blocking the entire blog post generation
    return [];
  }
}
