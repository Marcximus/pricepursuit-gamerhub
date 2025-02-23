
import { useState } from "react";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
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

  const { 
    data, 
    isLoading: isLaptopsLoading, 
    error: laptopsError,
    isRefetching,
  } = useLaptops(currentPage, sortBy, filters);

  const laptops = data?.laptops ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const { toast } = useToast();

  const filterOptions = useLaptopFilters(data?.allLaptops);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              />
            }
          />
        </div>
      </main>
    </div>
  );
};

export default ComparePriceLaptops;

