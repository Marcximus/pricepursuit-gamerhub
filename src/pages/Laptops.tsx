
import { useState, useEffect, useCallback } from "react";
import { useLaptops, ITEMS_PER_PAGE } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { LaptopList } from "@/components/laptops/LaptopList";
import { LaptopToolbar } from "@/components/laptops/LaptopToolbar";
import { LaptopLayout } from "@/components/laptops/LaptopLayout";
import { useLaptopFilters } from "@/hooks/useLaptopFilters";
import { useQueryClient } from "@tanstack/react-query";

const ComparePriceLaptops = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 10000 },
    processors: new Set<string>(),
    ramSizes: new Set<string>(),
    storageOptions: new Set<string>(),
    graphicsCards: new Set<string>(),
    screenSizes: new Set<string>(),
    brands: new Set<string>(),
  });

  // Pre-fetch additional pages for smoother navigation
  const queryClient = useQueryClient();
  
  // Get the first page of laptops with current filters
  const { 
    data, 
    isLoading: isLaptopsLoading, 
    error: laptopsError,
    isRefetching,
    refetch
  } = useLaptops(currentPage, sortBy, filters);

  const laptops = data?.laptops ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Prefetch next page when current page changes
  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ['laptops-batch', nextPage, sortBy, JSON.stringify(filters)],
        queryFn: () => new Promise((resolve) => {
          // Delay prefetching slightly to prioritize current page
          setTimeout(() => {
            import('@/services/laptopService').then(({ fetchLaptopsBatch }) => {
              fetchLaptopsBatch(nextPage, ITEMS_PER_PAGE).then(resolve);
            });
          }, 500);
        }),
      });
    }
  }, [currentPage, totalPages, sortBy, filters, queryClient]);

  const filterOptions = useLaptopFilters(data?.allLaptops);

  const handleSortChange = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset page when sort changes
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top for better UX when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    // Create a deep copy of the filter sets to avoid reference issues
    const updatedFilters: FilterOptions = {
      priceRange: { ...newFilters.priceRange },
      processors: new Set(newFilters.processors),
      ramSizes: new Set(newFilters.ramSizes),
      storageOptions: new Set(newFilters.storageOptions),
      graphicsCards: new Set(newFilters.graphicsCards),
      screenSizes: new Set(newFilters.screenSizes),
      brands: new Set(newFilters.brands),
    };
    
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <LaptopLayout
            filters={
              <LaptopFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                processors={filterOptions.processors}
                ramSizes={filterOptions.ramSizes}
                storageOptions={filterOptions.storageOptions}
                graphicsCards={filterOptions.graphicsCards}
                screenSizes={filterOptions.screenSizes}
                brands={filterOptions.brands}
              />
            }
            toolbar={
              <LaptopToolbar
                totalLaptops={totalCount}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                isLoading={isLaptopsLoading}
                isRefetching={isRefetching}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                filterOptions={filterOptions}
              />
            }
            content={
              <LaptopList
                laptops={laptops}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLaptopsLoading}
                error={laptopsError}
                isRefetching={isRefetching}
                onPageChange={handlePageChange}
                onRetry={handleRetry}
              />
            }
          />
        </div>
      </main>
    </div>
  );
}

export default ComparePriceLaptops;
