
import { useQuery } from "@tanstack/react-query";
import { fetchOptimizedLaptops, type LaptopFilterParams } from "@/utils/laptop/fetchOptimizedLaptops";

/**
 * Hook for fetching laptops using the optimized serverless function with React Query
 */
export const useOptimizedLaptops = (filters: LaptopFilterParams = {}) => {
  return useQuery({
    queryKey: ['optimized-laptops', filters],
    queryFn: () => fetchOptimizedLaptops(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
