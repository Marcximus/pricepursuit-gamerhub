
import { useState, useEffect } from "react";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { LaptopList } from "@/components/laptops/LaptopList";
import { LaptopToolbar } from "@/components/laptops/LaptopToolbar";
import { LaptopLayout } from "@/components/laptops/LaptopLayout";
import { useFilteredLaptops } from "@/hooks/useFilteredLaptops";
import { useLaptopFilters } from "@/hooks/useLaptopFilters";
import { collectLaptops } from "@/utils/laptop/collectLaptops";
import type { Product } from "@/types/product";

// Declare the global variable for TypeScript
declare const __INITIAL_DATA__: Product[];

const ComparePriceLaptops = () => {
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 10000 },
    processor: "all-processors",
    ram: "all-ram",
    storage: "all-storage",
    graphics: "all-graphics",
    screenSize: "all-screens",
    brand: "all-brands",
  });

  // Initialize with build-time data
  const [initialData] = useState<Product[]>(() => {
    try {
      return __INITIAL_DATA__ || [];
    } catch (e) {
      console.warn('No build-time data available:', e);
      return [];
    }
  });

  const { 
    data: laptops = initialData, 
    isLoading: isLaptopsLoading, 
    error: laptopsError,
    refetch: refetchLaptops,
    isRefetching,
    updateLaptops
  } = useLaptops();

  const { toast } = useToast();

  const filteredAndSortedLaptops = useFilteredLaptops(
    laptops.length > 0 ? laptops : initialData,
    filters, 
    sortBy
  );

  const filterOptions = useLaptopFilters(laptops.length > 0 ? laptops : initialData);

  const handleCollectLaptops = async () => {
    console.log('handleCollectLaptops called in Laptops.tsx');
    try {
      const result = await collectLaptops();
      console.log('Collection result:', result);
      
      if (result) {
        toast({
          title: "Collection Started",
          description: `Started collection process in ${result.batches} batches`,
        });

        // Poll for updates
        const pollInterval = setInterval(async () => {
          const { data: newData } = await refetchLaptops();
          if (newData && newData.length > 0) {
            clearInterval(pollInterval);
            toast({
              title: "Collection Complete",
              description: `Found ${newData.length} laptops`,
            });
          }
        }, 10000);

        // Clear interval after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error) {
      console.error('Error in handleCollectLaptops:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start laptop collection. Please try again.",
      });
    }
  };

  const handleUpdateLaptops = async () => {
    try {
      await updateLaptops();
      toast({
        title: "Update Started",
        description: "Started updating laptop information. This may take a few minutes.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start laptop updates. Please try again.",
      });
    }
  };

  // Only show loading state if we don't have any data at all
  const showLoading = isLaptopsLoading && laptops.length === 0 && initialData.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <LaptopLayout
            filters={
              <LaptopFilters
                filters={filters}
                onFiltersChange={setFilters}
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
                totalLaptops={filteredAndSortedLaptops.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCollectLaptops={handleCollectLaptops}
                onUpdateLaptops={handleUpdateLaptops}
                isLoading={showLoading}
                isRefetching={isRefetching}
              />
            }
            content={
              <LaptopList
                laptops={filteredAndSortedLaptops}
                isLoading={showLoading}
                error={laptopsError}
                onRetry={handleCollectLaptops}
                isRefetching={isRefetching}
              />
            }
          />
        </div>
      </main>
    </div>
  );
};

export default ComparePriceLaptops;

