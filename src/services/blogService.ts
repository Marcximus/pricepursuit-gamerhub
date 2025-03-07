
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface GeneratedBlogContent {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags?: string[];
  productData?: {
    asin: string;
    title: string;
    brand: string;
    price: number;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    productUrl: string;
  };
}

interface SearchParam {
  brand?: string;
  processor?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  storage?: string;
  graphics?: string;
}

export async function generateBlogPost(
  prompt: string,
  category: string,
  asin?: string
): Promise<GeneratedBlogContent | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-blog-post', {
      body: {
        prompt,
        category,
        asin
      },
    });

    if (error) {
      console.error('Error generating blog post:', error);
      throw new Error(error.message || 'Failed to generate blog post');
    }

    // For Top 10 posts, process product data placeholders
    if (category === 'Top10' && data && data.content) {
      data.content = await processTop10Content(data.content, prompt);
    }

    return data;
  } catch (error) {
    console.error('Error in generateBlogPost:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to generate blog post',
      variant: 'destructive',
    });
    return null;
  }
}

async function processTop10Content(content: string, prompt: string): Promise<string> {
  try {
    // Extract search parameters from the prompt
    const searchParams = extractSearchParams(prompt);
    
    // Fetch products using the edge function
    const { data, error } = await supabase.functions.invoke('fetch-top10-products', {
      body: {
        searchParams,
        count: 10
      },
    });
    
    if (error) {
      console.error('Error fetching products:', error);
      return content;
    }
    
    if (!data || !data.products || data.products.length === 0) {
      console.warn('No products found for the search parameters');
      return content;
    }
    
    // Replace the product data placeholders with actual data
    let processedContent = content;
    
    for (let i = 0; i < Math.min(data.products.length, 10); i++) {
      const product = data.products[i];
      const placeholderRegex = new RegExp(`<div class="product-data" data-product-id="${i+1}">\\[PRODUCT_DATA_${i+1}\\]</div>`, 'g');
      processedContent = processedContent.replace(placeholderRegex, product.htmlContent);
    }
    
    return processedContent;
  } catch (error) {
    console.error('Error processing Top 10 content:', error);
    return content;
  }
}

function extractSearchParams(prompt: string): SearchParam[] {
  // Default search parameter
  const defaultParam: SearchParam = {};
  
  // Try to extract brand information
  const brandMatches = prompt.match(/\b(lenovo|hp|dell|asus|acer|apple|msi|alienware|razer|microsoft|samsung|gigabyte|lg)\b/gi);
  if (brandMatches && brandMatches.length > 0) {
    defaultParam.brand = brandMatches[0];
  }
  
  // Try to extract processor information
  if (prompt.match(/\b(gaming|game|gamer)\b/i)) {
    defaultParam.processor = 'i7';
    defaultParam.graphics = 'RTX';
  } else if (prompt.match(/\b(budget|cheap|affordable|under\s*\$\s*800)\b/i)) {
    defaultParam.maxPrice = 800;
  } else if (prompt.match(/\b(professional|work|business)\b/i)) {
    defaultParam.processor = 'i5';
  }
  
  // Extract price ranges
  const priceMatches = prompt.match(/\b(under|below)\s*\$\s*(\d+)/i);
  if (priceMatches && priceMatches[2]) {
    defaultParam.maxPrice = parseInt(priceMatches[2]);
  }
  
  const priceRangeMatches = prompt.match(/\$\s*(\d+)\s*-\s*\$\s*(\d+)/);
  if (priceRangeMatches && priceRangeMatches[1] && priceRangeMatches[2]) {
    defaultParam.minPrice = parseInt(priceRangeMatches[1]);
    defaultParam.maxPrice = parseInt(priceRangeMatches[2]);
  }
  
  // If no parameters were extracted, return a default set
  if (Object.keys(defaultParam).length === 0) {
    return [
      { brand: 'Lenovo' },
      { brand: 'HP' },
      { brand: 'Dell' },
      { brand: 'ASUS' },
      { brand: 'Acer' }
    ];
  }
  
  return [defaultParam];
}

export async function uploadBlogImage(
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-assets')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from('blog-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to upload image',
      variant: 'destructive',
    });
    return null;
  }
}
