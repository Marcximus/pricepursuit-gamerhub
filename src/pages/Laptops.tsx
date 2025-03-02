import { useState, useEffect } from "react";
import { useLaptops } from "@/hooks/useLaptops";
import { useFilteredLaptops } from "@/hooks/useFilteredLaptops";
import Navigation from "@/components/Navigation";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { LaptopList } from "@/components/laptops/LaptopList";
import { LaptopToolbar } from "@/components/laptops/LaptopToolbar";
import { LaptopLayout } from "@/components/laptops/LaptopLayout";
import { useLaptopFilters } from "@/hooks/useLaptopFilters";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAllLaptops } from "@/services/laptopService";

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
  
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Filter state updated:', {
      processors: Array.from(filters.processors),
      ramSizes: Array.from(filters.ramSizes),
      storageOptions: Array.from(filters.storageOptions),
      graphicsCards: Array.from(filters.graphicsCards),
      screenSizes: Array.from(filters.screenSizes),
      brands: Array.from(filters.brands),
      priceRange: filters.priceRange,
    });
  }, [filters]);

  const { 
    data, 
    isLoading: isLaptopsLoading, 
    error: laptopsError,
    isRefetching,
    refetch
  } = useLaptops(currentPage, sortBy, filters);

  const { 
    filteredLaptops, 
    filterStats 
  } = useFilteredLaptops(data?.allLaptops || [], filters);

  const laptops = data?.laptops ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const filterOptions = useLaptopFilters(data?.allLaptops);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    toast.info(`Sorting laptops by ${newSortBy.replace('-', ' ')}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
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
    setCurrentPage(1);
    
    const totalFilters = 
      updatedFilters.processors.size +
      updatedFilters.ramSizes.size +
      updatedFilters.storageOptions.size +
      updatedFilters.graphicsCards.size +
      updatedFilters.screenSizes.size +
      updatedFilters.brands.size +
      (updatedFilters.priceRange.min > 0 || updatedFilters.priceRange.max < 10000 ? 1 : 0);
      
    if (totalFilters > 0) {
      toast.info(`${totalFilters} filter${totalFilters > 1 ? 's' : ''} applied`);
    }
  };

  const handleRetry = () => {
    toast.promise(
      refetch(),
      {
        loading: 'Refreshing laptop data...',
        success: 'Laptop data refreshed successfully',
        error: 'Failed to refresh laptop data'
      }
    );
  };

  useEffect(() => {
    if (currentPage < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['all-laptops', { page: currentPage + 1, sortBy, filters }],
        queryFn: fetchAllLaptops
      });
    }
  }, [currentPage, sortBy, filters, totalPages, queryClient]);

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
                totalLaptops={filterStats.count || totalCount}
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
