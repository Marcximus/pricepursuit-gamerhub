
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Support both GET and POST methods
    let filterParams;
    
    if (req.method === 'POST') {
      // Parse the request body for query parameters
      const { query } = await req.json();
      filterParams = {
        brand: query.brand || null,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : null,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : null,
        ram: query.ram || null,
        processor: query.processor || null,
        storage: query.storage || null,
        graphics: query.graphics || null,
        screenSize: query.screenSize || null,
        sortBy: query.sortBy || 'wilson_score',
        sortDir: query.sortDir || 'desc',
        page: query.page ? parseInt(query.page) : 1,
        pageSize: query.pageSize ? parseInt(query.pageSize) : 20
      };
    } else {
      // Parse filter params from URL for GET requests
      const url = new URL(req.url);
      filterParams = {
        brand: url.searchParams.get('brand'),
        minPrice: url.searchParams.get('minPrice') ? parseFloat(url.searchParams.get('minPrice')) : null,
        maxPrice: url.searchParams.get('maxPrice') ? parseFloat(url.searchParams.get('maxPrice')) : null,
        ram: url.searchParams.get('ram'),
        processor: url.searchParams.get('processor'),
        storage: url.searchParams.get('storage'),
        graphics: url.searchParams.get('graphics'),
        screenSize: url.searchParams.get('screenSize'),
        sortBy: url.searchParams.get('sortBy') || 'wilson_score',
        sortDir: url.searchParams.get('sortDir') || 'desc',
        page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')) : 1,
        pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize')) : 20
      };
    }

    console.log('Request received with parameters:', filterParams);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Build query with performance optimizations
    let query = supabase
      .from('products')
      .select('id, asin, title, brand, model, current_price, original_price, processor, ram, storage, graphics, screen_size, image_url, rating, wilson_score', { count: 'exact' })
      .eq('is_laptop', true);
    
    // Only include non-null filters
    if (filterParams.brand) {
      // Split comma-separated brands
      const brands = filterParams.brand.split(',');
      if (brands.length === 1) {
        query = query.eq('brand', brands[0]);
      } else if (brands.length > 1) {
        query = query.in('brand', brands);
      }
    }
    
    if (filterParams.ram) {
      // Split comma-separated RAM sizes
      const ramSizes = filterParams.ram.split(',');
      if (ramSizes.length === 1) {
        query = query.eq('ram', ramSizes[0]);
      } else if (ramSizes.length > 1) {
        query = query.in('ram', ramSizes);
      }
    }
    
    if (filterParams.storage) {
      // Split comma-separated storage sizes
      const storageSizes = filterParams.storage.split(',');
      if (storageSizes.length === 1) {
        query = query.ilike('storage', `%${storageSizes[0]}%`);
      } else if (storageSizes.length > 1) {
        query = query.or(storageSizes.map(size => `storage.ilike.%${size}%`).join(','));
      }
    }
    
    if (filterParams.processor) {
      // Split comma-separated processors
      const processors = filterParams.processor.split(',');
      if (processors.length === 1) {
        query = query.ilike('processor', `%${processors[0]}%`);
      } else if (processors.length > 1) {
        query = query.or(processors.map(proc => `processor.ilike.%${proc}%`).join(','));
      }
    }
    
    if (filterParams.graphics) {
      // Split comma-separated graphics
      const graphicsCards = filterParams.graphics.split(',');
      if (graphicsCards.length === 1) {
        query = query.ilike('graphics', `%${graphicsCards[0]}%`);
      } else if (graphicsCards.length > 1) {
        query = query.or(graphicsCards.map(gpu => `graphics.ilike.%${gpu}%`).join(','));
      }
    }
    
    if (filterParams.screenSize) {
      // Split comma-separated screen sizes
      const screenSizes = filterParams.screenSize.split(',');
      if (screenSizes.length === 1) {
        query = query.ilike('screen_size', `%${screenSizes[0]}%`);
      } else if (screenSizes.length > 1) {
        query = query.or(screenSizes.map(size => `screen_size.ilike.%${size}%`).join(','));
      }
    }
    
    if (filterParams.minPrice !== null) {
      query = query.gte('current_price', filterParams.minPrice);
    }
    
    if (filterParams.maxPrice !== null) {
      query = query.lte('current_price', filterParams.maxPrice);
    }
    
    // Add pagination
    const from = (filterParams.page - 1) * filterParams.pageSize;
    const to = from + filterParams.pageSize - 1;
    
    // Add sorting
    const sortDirection = filterParams.sortDir === 'asc' ? true : false;
    query = query.order(filterParams.sortBy, { ascending: sortDirection, nullsFirst: false });
    
    // Execute query with pagination
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching laptops:', error);
      throw error;
    }

    console.log(`Query returned ${data.length} laptops, total count: ${count}`);

    // Add cache headers
    const headers = { 
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300', // Cache for 1 minute client-side, 5 minutes CDN
    };

    // Return paginated data with metadata
    return new Response(
      JSON.stringify({
        data,
        meta: {
          totalCount: count,
          page: filterParams.page,
          pageSize: filterParams.pageSize,
          totalPages: Math.ceil((count || 0) / filterParams.pageSize)
        }
      }),
      { headers }
    );

  } catch (error) {
    console.error('Error in fetch-laptops function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
