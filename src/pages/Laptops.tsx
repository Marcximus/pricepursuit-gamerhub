
import { useState, useEffect } from "react";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { LaptopList } from "@/components/laptops/LaptopList";
import { LaptopToolbar } from "@/components/laptops/LaptopToolbar";
import { LaptopLayout } from "@/components/laptops/LaptopLayout";
import { useLaptopFilters } from "@/hooks/useLaptopFilters";

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

  // Add debugging useEffect to track filter changes
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

  const laptops = data?.laptops ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const allLaptops = data?.allLaptops ?? [];

  const filterOptions = useLaptopFilters(allLaptops);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset page when sort changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
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
  };

  const handleRetry = () => {
    refetch();
  };

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
                allLaptops={allLaptops}
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
