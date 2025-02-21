
import { useState } from "react";
import { useProduct } from "@/hooks/useProduct";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { SearchForm } from "@/components/laptops/SearchForm";
import { LaptopList } from "@/components/laptops/LaptopList";
import { LaptopToolbar } from "@/components/laptops/LaptopToolbar";
import { LaptopLayout } from "@/components/laptops/LaptopLayout";
import { useFilteredLaptops } from "@/hooks/useFilteredLaptops";
import { useLaptopFilters } from "@/hooks/useLaptopFilters";

const ComparePriceLaptops = () => {
  const [searchAsin, setSearchAsin] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 10000 },
    processor: "all-processors",
    ram: "all-ram",
    storage: "all-storage",
    graphics: "all-graphics",
    screenSize: "all-screens",
  });

  const { data: product, isLoading: isProductLoading } = useProduct(searchAsin);
  const { 
    data: laptops, 
    isLoading: isLaptopsLoading, 
    error: laptopsError,
    refetch: refetchLaptops,
    isRefetching,
    collectLaptops
  } = useLaptops();
  const { toast } = useToast();

  console.log('Raw laptops data:', laptops?.length, 'laptops');
  console.log('Current filters:', filters);
  console.log('Current sort:', sortBy);

  const filteredAndSortedLaptops = useFilteredLaptops(laptops, filters, sortBy);
  const filterOptions = useLaptopFilters(laptops);

  const handleCollectLaptops = async () => {
    try {
      await collectLaptops();
      toast({
        title: "Collection Started",
        description: "Started collecting laptops from Amazon. This may take a few minutes...",
      });
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

      setTimeout(() => {
        clearInterval(pollInterval);
      }, 300000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start laptop collection. Please try again.",
      });
    }
  };

  const handleRetry = async () => {
    try {
      await collectLaptops();
      toast({
        title: "Success",
        description: "Started collecting laptops from Amazon...",
      });
      setTimeout(() => refetchLaptops(), 5000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to collect laptops. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm onSearch={setSearchAsin} />
          
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
              />
            }
            toolbar={
              <LaptopToolbar
                totalLaptops={filteredAndSortedLaptops.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCollectLaptops={handleCollectLaptops}
                isLoading={isLaptopsLoading}
                isRefetching={isRefetching}
              />
            }
            content={
              <LaptopList
                laptops={filteredAndSortedLaptops}
                isLoading={isLaptopsLoading}
                error={laptopsError}
                onRetry={handleRetry}
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

