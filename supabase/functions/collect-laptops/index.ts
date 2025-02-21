import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to normalize laptop titles for comparison
function normalizeLaptopTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Function to check if a title is too similar to existing ones 
function isTitleTooSimilar(title: string, existingTitles: Set<string>): boolean {
  const normalizedNew = normalizeLaptopTitle(title);
  for (const existing of existingTitles) {
    const normalizedExisting = normalizeLaptopTitle(existing);
    const longerLength = Math.max(normalizedNew.length, normalizedExisting.length);
    const distance = levenshteinDistance(normalizedNew, normalizedExisting);
    const similarity = (longerLength - distance) / longerLength;
    
    if (similarity > 0.9) {
      return true;
    }
  }
  return false;
}

// Function to extract brand and model from title
function extractBrandAndModel(title: string): { brand: string; model: string | null } {
  // Define brand patterns with their common model prefixes
  const brandPatterns = {
    'MSI': ['Raider', 'Titan', 'Katana', 'Stealth', 'Creator', 'Modern', 'Prestige', 'Vector', 'Sword', 'Pulse', 'Alpha', 'Bravo', 'Delta'],
    'Lenovo': ['ThinkPad', 'IdeaPad', 'Legion', 'Yoga'],
    'HP': ['Pavilion', 'Envy', 'Spectre', 'Omen', 'EliteBook', 'ProBook'],
    'Dell': ['XPS', 'Inspiron', 'Latitude', 'Precision', 'Alienware', 'Vostro'],
    'ASUS': ['ROG', 'TUF', 'ZenBook', 'VivoBook', 'ProArt', 'ExpertBook'],
    'Acer': ['Predator', 'Nitro', 'Swift', 'Aspire', 'TravelMate', 'ConceptD'],
    'Apple': ['MacBook'],
    'Microsoft': ['Surface'],
    'Samsung': ['Galaxy Book'],
    'Razer': ['Blade'],
    'LG': ['Gram'],
    'Huawei': ['MateBook'],
    'GIGABYTE': ['AORUS', 'AERO'],
    'Dynabook': ['Tecra', 'Portege'],
    'Toshiba': ['Satellite', 'Tecra'],
    'Fujitsu': ['LIFEBOOK'],
    'Panasonic': ['Toughbook'],
    'VAIO': ['VAIO'],
    'Xiaomi': ['RedmiBook', 'Mi Notebook']
  };

  // First try to match brand with model prefix
  for (const [brand, modelPrefixes] of Object.entries(brandPatterns)) {
    for (const prefix of modelPrefixes) {
      if (title.includes(prefix)) {
        // Extract model name: everything after the prefix until the next major delimiter
        const modelMatch = title.match(new RegExp(`${prefix}\\s+([\\w-]+)`));
        return {
          brand,
          model: modelMatch ? `${prefix} ${modelMatch[1]}` : prefix
        };
      }
    }
    // If brand name exists in title without a specific model prefix
    if (title.includes(brand)) {
      // Try to extract model: look for numbers and letters after the brand
      const modelMatch = title.match(new RegExp(`${brand}\\s+([\\w-]+)`));
      return {
        brand,
        model: modelMatch ? modelMatch[1] : null
      };
    }
  }

  // If no specific brand/model pattern is found
  return {
    brand: 'Unknown Brand',
    model: null
  };
}

// Function to collect reviews for a product
async function collectProductReviews(asin: string, oxyUsername: string, oxyPassword: string, supabaseClient: any, productId: string) {
  console.log(`Collecting reviews for product ${asin}...`);
  
  try {
    const payload = {
      source: 'amazon_reviews',
      domain: 'com',
      query: asin,
      start_page: '1',
      pages: '2',
      parse: true
    };

    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Failed to fetch reviews for ${asin}:`, await response.text());
      return;
    }

    const data = await response.json();
    const reviews = data.results?.[0]?.content?.reviews || [];
    console.log(`Found ${reviews.length} reviews for product ${asin}`);

    // Process and insert reviews
    for (const review of reviews) {
      if (!review.rating || !review.date) continue;

      const reviewData = {
        product_id: productId,
        rating: parseInt(review.rating),
        title: review.title || null,
        content: review.content || null,
        reviewer_name: review.reviewer || 'Anonymous',
        review_date: new Date(review.date).toISOString(),
        verified_purchase: review.verified_purchase || false,
        helpful_votes: parseInt(review.helpful_votes || '0')
      };

      const { error: insertError } = await supabaseClient
        .from('product_reviews')
        .upsert([reviewData]);

      if (insertError) {
        console.error(`Error saving review for ${asin}:`, insertError);
      }
    }

    // Update product with review stats
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, review: any) => sum + parseInt(review.rating || 0), 0);
      const averageRating = totalRating / reviews.length;

      const { error: updateError } = await supabaseClient
        .from('products')
        .update({
          average_rating: averageRating,
          total_reviews: reviews.length,
          review_data: {
            rating_breakdown: reviews.reduce((acc: any, review: any) => {
              const rating = parseInt(review.rating || 0);
              acc[rating] = (acc[rating] || 0) + 1;
              return acc;
            }, {}),
            recent_reviews: reviews.slice(0, 5).map(review => ({
              rating: parseInt(review.rating || 0),
              title: review.title || '',
              content: review.content || '',
              reviewer_name: review.reviewer || 'Anonymous',
              review_date: new Date(review.date).toISOString(),
              verified_purchase: review.verified_purchase || false,
              helpful_votes: parseInt(review.helpful_votes || '0')
            }))
          }
        })
        .eq('id', productId);

      if (updateError) {
        console.error(`Error updating product review stats for ${asin}:`, updateError);
      }
    }
  } catch (error) {
    console.error(`Error collecting reviews for ${asin}:`, error);
  }
}

// Levenshtein distance calculation for title similarity
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action = 'start', mode = 'discovery' } = await req.json()
    
    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')
    
    if (!oxyUsername || !oxyPassword) {
      throw new Error('Missing Oxylabs credentials')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'start') {
      let currentPage = 1
      const existingTitles = new Set<string>()
      
      // Get existing laptop titles to check for duplicates
      const { data: existingLaptops, error: fetchError } = await supabaseClient
        .from('products')
        .select('title')
        .eq('is_laptop', true)
      
      if (fetchError) {
        throw new Error(`Failed to fetch existing laptops: ${fetchError.message}`)
      }

      existingLaptops?.forEach(laptop => {
        if (laptop.title) existingTitles.add(laptop.title)
      })

      while (currentPage <= 5) {
        console.log(`Processing page ${currentPage}...`)
        
        try {
          const payload = {
            source: 'amazon_search',
            domain: 'co.uk',
            query: 'laptop',
            start_page: currentPage.toString(),
            pages: '1',
            context: [
              { key: 'sort_by', value: 'featured' }
            ],
            parse: true
          }

          const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
            },
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch results: ${await response.text()}`)
          }

          const data = await response.json()
          const results = data.results?.[0]?.content?.results

          if (results && Array.isArray(results)) {
            for (const item of results) {
              if (!item.title || isTitleTooSimilar(item.title, existingTitles)) {
                continue
              }

              // Extract brand and model from title
              const { brand, model } = extractBrandAndModel(item.title);

              const productData = {
                asin: item.asin,
                title: item.title,
                current_price: parseFloat(item.price?.value || 0),
                original_price: parseFloat(item.price?.original_price || 0) || null,
                rating: parseFloat(item.rating || 0),
                rating_count: parseInt(item.reviews?.rating_count || 0),
                image_url: item.image?.url || null,
                product_url: item.url || null,
                is_laptop: true,
                brand: brand,
                model: model,
                last_checked: new Date().toISOString()
              }

              const { data: insertedProduct, error: insertError } = await supabaseClient
                .from('products')
                .upsert([productData])
                .select()
                .single()

              if (insertError) {
                console.error(`Error saving product ${item.asin}:`, insertError)
                continue
              }

              // Collect reviews for this product
              await collectProductReviews(item.asin, oxyUsername, oxyPassword, supabaseClient, insertedProduct.id)
              
              console.log(`Successfully saved laptop and reviews: ${item.asin}`)
            }
          }
        } catch (error) {
          console.error(`Error processing page ${currentPage}:`, error)
          break
        }

        currentPage++
      }

      return new Response(
        JSON.stringify({
          message: 'Collection process completed',
          status: 'success'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({
        message: 'Invalid action specified',
        status: 'error'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({
        message: error.message || 'An unexpected error occurred',
        status: 'error'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
