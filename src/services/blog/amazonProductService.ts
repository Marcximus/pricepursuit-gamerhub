
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface AmazonSearchParams {
  query: string;
  brand?: string;
  maxPrice?: number;
  category?: string;
}

export async function fetchAmazonProducts(searchParams: AmazonSearchParams): Promise<any[] | null> {
  console.log('🚀 Fetching Amazon products with params:', searchParams);
  
  try {
    const { data, error } = await supabase.functions.invoke('fetch-amazon-products', {
      body: searchParams
    });
    
    if (error) {
      console.error('Error fetching Amazon products:', error);
      toast({
        title: 'Error fetching products',
        description: error.message || 'Failed to fetch product data',
        variant: 'destructive',
      });
      return null;
    }
    
    if (!data || !data.products || data.products.length === 0) {
      console.warn('No products found with the given search parameters');
      toast({
        title: 'No products found',
        description: 'We couldn\'t find any products matching your criteria',
        variant: 'default',
      });
      return null;
    }
    
    console.log(`✅ Successfully fetched ${data.products.length} products from Amazon`);
    return data.products;
  } catch (error) {
    console.error('Error in fetchAmazonProducts:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to fetch Amazon products',
      variant: 'destructive',
    });
    return null;
  }
}

export function extractSearchParamsFromPrompt(prompt: string): AmazonSearchParams {
  console.log(`📝 Extracting search parameters from prompt: "${prompt}"`);
  
  // Default search parameter
  const searchParams: AmazonSearchParams = {
    query: '',
  };
  
  // Convert to lowercase for case-insensitive matching
  const promptLower = prompt.toLowerCase();
  
  // Extract brand (common laptop brands)
  const brandMatches = promptLower.match(/\b(lenovo|hp|dell|asus|acer|apple|msi|alienware|razer|microsoft|samsung|gigabyte|lg)\b/i);
  if (brandMatches && brandMatches[0]) {
    searchParams.brand = brandMatches[0];
    console.log(`👔 Found brand: ${searchParams.brand}`);
    
    // Add brand to query
    searchParams.query = searchParams.brand;
  }
  
  // Extract price range
  const maxPriceMatch = promptLower.match(/\bunder\s*\$?(\d+)\b/i);
  if (maxPriceMatch && maxPriceMatch[1]) {
    searchParams.maxPrice = parseInt(maxPriceMatch[1], 10);
    console.log(`💰 Found max price: $${searchParams.maxPrice}`);
  }
  
  // Extract category/usage
  if (promptLower.includes('gaming')) {
    searchParams.category = 'gaming';
    searchParams.query += ' gaming laptop';
    console.log('🎮 Detected gaming category');
  } else if (promptLower.includes('business') || promptLower.includes('work')) {
    searchParams.category = 'business';
    searchParams.query += ' business laptop';
    console.log('💼 Detected business category');
  } else if (promptLower.includes('student') || promptLower.includes('college')) {
    searchParams.category = 'student';
    searchParams.query += ' student laptop';
    console.log('🎓 Detected student category');
  } else {
    // Default query if no specific category is found
    searchParams.query += ' laptop';
    console.log('📊 Using default laptop category');
  }
  
  // Ensure the query is not empty
  if (!searchParams.query.trim()) {
    searchParams.query = 'laptop';
    console.log('⚠️ Query was empty, defaulting to "laptop"');
  }
  
  console.log(`🔍 Final extracted search parameters:`, searchParams);
  return searchParams;
}
