
import { useState, useEffect, useCallback, useRef } from "react";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { LaptopList } from "@/components/laptops/LaptopList";
import { LaptopToolbar } from "@/components/laptops/LaptopToolbar";
import { LaptopLayout } from "@/components/laptops/LaptopLayout";
import { useLaptopFilters } from "@/hooks/useLaptopFilters";
import { toast } from "@/components/ui/use-toast";

// Debounce function to limit filter updates
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Create deep copy of filter sets to prevent reference issues
const createFiltersCopy = (filters: FilterOptions): FilterOptions => {
  return {
    priceRange: { ...filters.priceRange },
    processors: new Set(filters.processors),
    ramSizes: new Set(filters.ramSizes),
    storageOptions: new Set(filters.storageOptions),
    graphicsCards: new Set(filters.graphicsCards),
    screenSizes: new Set(filters.screenSizes),
    brands: new Set(filters.brands),
  };
};

const ComparePriceLaptops = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");
  const [rawFilters, setRawFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 10000 },
    processors: new Set<string>(),
    ramSizes: new Set<string>(),
    storageOptions: new Set<string>(),
    graphicsCards: new Set<string>(),
    screenSizes: new Set<string>(),
    brands: new Set<string>(),
  });
  
  // Add a ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Reduce debounce time for more responsive filtering (150ms instead of 300ms)
  const filters = useDebounce(rawFilters, 150);

  // Log filter changes both before and after debounce
  useEffect(() => {
    console.log('Raw filter state updated (before debounce):', {
      processors: Array.from(rawFilters.processors),
      ramSizes: Array.from(rawFilters.ramSizes),
      storageOptions: Array.from(rawFilters.storageOptions),
      graphicsCards: Array.from(rawFilters.graphicsCards),
      screenSizes: Array.from(rawFilters.screenSizes),
      brands: Array.from(rawFilters.brands),
      priceRange: rawFilters.priceRange,
    });
  }, [rawFilters]);
  
  useEffect(() => {
    console.log('Debounced filter state updated (after debounce):', {
      processors: Array.from(filters.processors),
      ramSizes: Array.from(filters.ramSizes),
      storageOptions: Array.from(filters.storageOptions),
      graphicsCards: Array.from(filters.graphicsCards),
      screenSizes: Array.from(filters.screenSizes),
      brands: Array.from(filters.brands),
      priceRange: filters.priceRange,
    });
  }, [filters]);

  // Add toast notifications for better UX
  const prevFiltersRef = useRef<FilterOptions | null>(null);
  
  useEffect(() => {
    if (prevFiltersRef.current) {
      const brandsBefore = Array.from(prevFiltersRef.current.brands);
      const brandsAfter = Array.from(filters.brands);
      
      // Check if brands were added
      const addedBrands = brandsAfter.filter(brand => !brandsBefore.includes(brand));
      if (addedBrands.length > 0) {
        console.log(`Brand filter added: ${addedBrands.join(', ')}`);
      }
      
      // Check if brands were removed
      const removedBrands = brandsBefore.filter(brand => !brandsAfter.includes(brand));
      if (removedBrands.length > 0) {
        console.log(`Brand filter removed: ${removedBrands.join(', ')}`);
      }
    }
    
    // Update the ref for next comparison
    prevFiltersRef.current = createFiltersCopy(filters);
  }, [filters]);

  const { 
    data, 
    isLoading, 
    error,
    isRefetching,
    refetch,
    isFullDataLoaded
  } = useLaptops(currentPage, sortBy, filters);

  const laptops = data?.laptops ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const isPartialData = data?.isPartialData;

  // Log whenever new laptop data is received
  useEffect(() => {
    if (data && data.laptops) {
      console.log(`Received ${data.laptops.length} laptops on page ${currentPage}, total: ${data.totalCount}`);
    }
  }, [data, currentPage]);

  const filterOptions = useLaptopFilters(data?.allLaptops);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset page when sort changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    // Only update if component is still mounted
    if (!isMounted.current) return;
    
    console.log('handleFiltersChange called with:', {
      brands: Array.from(newFilters.brands),
      processors: Array.from(newFilters.processors),
      priceRange: newFilters.priceRange
    });
    
    // Create a deep copy of the filter sets to avoid reference issues
    setRawFilters(createFiltersCopy(newFilters));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleRetry = () => {
    refetch();
    toast({
      title: "Refreshing data",
      description: "Trying to fetch the latest laptop data...",
    });
  };

  // Add effect to detect when brands filter is applied and log details
  useEffect(() => {
    const brandCount = filters.brands.size;
    if (brandCount > 0) {
      console.log(`Active brand filters (${brandCount}):`, Array.from(filters.brands));
    }
  }, [filters.brands]);

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
                isLoading={isLoading}
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
                isLoading={isLoading}
                isPartialData={isPartialData}
                isFullDataLoaded={isFullDataLoaded}
                error={error}
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
