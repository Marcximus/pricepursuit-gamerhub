
import { useState, useEffect } from "react";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { LaptopList } from "@/components/laptops/LaptopList";
import LaptopToolbar from "@/components/laptops/LaptopToolbar";
import { LaptopLayout } from "@/components/laptops/LaptopLayout";
import { useLaptopFilters } from "@/hooks/useLaptopFilters";
import CompareFloatingButton from "@/components/CompareFloatingButton";
import Footer from "@/components/about/Footer";

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
    searchQuery: "",
  });

  useEffect(() => {
    console.log('Filter state updated:', {
      processors: Array.from(filters.processors),
      ramSizes: Array.from(filters.ramSizes),
      storageOptions: Array.from(filters.storageOptions),
      graphicsCards: Array.from(filters.graphicsCards),
      screenSizes: Array.from(filters.screenSizes),
      brands: Array.from(filters.brands),
      priceRange: filters.priceRange,
      searchQuery: filters.searchQuery,
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

  const filterOptions = useLaptopFilters(data?.allLaptops);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      searchQuery: newFilters.searchQuery || "",
    };
    
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="pt-16 pb-16" role="main">
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
                totalCount={totalCount}
                filteredCount={laptops.length}
                sortOption={sortBy}
                onSortChange={handleSortChange}
                filters={filters}
                setFilters={handleFiltersChange}
                searchTerm={filters.searchQuery}
                setSearchTerm={(value) => {
                  if (typeof value === 'function') {
                    const newValue = value(filters.searchQuery);
                    handleFiltersChange({...filters, searchQuery: newValue});
                  } else {
                    handleFiltersChange({...filters, searchQuery: value});
                  }
                }}
                isLoading={isLaptopsLoading}
                isRefetching={isRefetching}
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
          <CompareFloatingButton />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ComparePriceLaptops;
