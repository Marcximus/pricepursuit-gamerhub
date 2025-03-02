
import { supabase } from "@/integrations/supabase/client";

export type LaptopFilterParams = {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  processor?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export type OptimizedLaptopResult = {
  data: any[];
  meta: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

/**
 * Fetches laptops using the optimized serverless function
 */
export async function fetchOptimizedLaptops(filters: LaptopFilterParams = {}): Promise<OptimizedLaptopResult> {
  const {
    brand,
    minPrice,
    maxPrice,
    ram,
    processor,
    sortBy = 'wilson_score',
    sortDir = 'desc',
    page = 1,
    pageSize = 20
  } = filters;

  // Build query params
  const params = new URLSearchParams();
  if (brand) params.append('brand', brand);
  if (minPrice !== undefined && minPrice !== null) params.append('minPrice', minPrice.toString());
  if (maxPrice !== undefined && maxPrice !== null) params.append('maxPrice', maxPrice.toString());
  if (ram) params.append('ram', ram);
  if (processor) params.append('processor', processor);
  params.append('sortBy', sortBy);
  params.append('sortDir', sortDir);
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  try {
    const { data, error } = await supabase.functions.invoke('fetch-laptops', {
      method: 'GET',
      query: Object.fromEntries(params)
    });

    if (error) {
      console.error('Error fetching optimized laptops:', error);
      throw error;
    }

    return data as OptimizedLaptopResult;
  } catch (error) {
    console.error('Error in fetchOptimizedLaptops:', error);
    throw error;
  }
}
