import { useState } from "react";
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

const ComparePriceLaptops = () => {
  const [currentPage, setCurrentPage] = useState(1);
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

  const { 
    data, 
    isLoading: isLaptopsLoading, 
    error: laptopsError,
    refetch: refetchLaptops,
    isRefetching,
    updateLaptops
  } = useLaptops(currentPage, sortBy);

  const laptops = data?.laptops ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const { toast } = useToast();

  const filteredLaptops = useFilteredLaptops(laptops, filters, 'rating-desc');

  const filterOptions = useLaptopFilters(laptops);

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

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

        const pollInterval = setInterval(async () => {
          const { data: newData } = await refetchLaptops();
          if (newData && newData.laptops.length > 0) {
            clearInterval(pollInterval);
            toast({
              title: "Collection Complete",
              description: `Found ${newData.laptops.length} laptops`,
            });
          }
        }, 10000);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                totalLaptops={filteredLaptops.length}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onCollectLaptops={handleCollectLaptops}
                onUpdateLaptops={handleUpdateLaptops}
                isLoading={isLaptopsLoading}
                isRefetching={isRefetching}
              />
            }
            content={
              <LaptopList
                laptops={filteredLaptops}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLaptopsLoading}
                error={laptopsError}
                onRetry={handleCollectLaptops}
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
