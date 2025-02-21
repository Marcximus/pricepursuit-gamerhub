
import { useState } from "react";
import { useProduct } from "@/hooks/useProduct";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { SearchForm } from "@/components/laptops/SearchForm";
import { LaptopList } from "@/components/laptops/LaptopList";
import { LaptopToolbar } from "@/components/laptops/LaptopToolbar";
import type { Product } from "@/types/product";

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

  const getUniqueValues = (key: keyof Product) => {
    if (!laptops) return new Set<string>();
    return new Set(laptops.map(laptop => {
      const value = laptop[key];
      return value ? String(value) : null;
    }).filter(Boolean));
  };

  const filterLaptops = (laptops: Product[] | undefined) => {
    if (!laptops) {
      console.log('No laptops to filter');
      return [];
    }
    
    const filtered = laptops.filter(laptop => {
      const price = laptop.current_price || 0;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        console.log(`Laptop ${laptop.title} filtered out due to price ${price}`);
        return false;
      }
      
      if (filters.processor !== "all-processors" && laptop.processor && 
          !laptop.processor.toLowerCase().includes(filters.processor.toLowerCase())) {
        console.log(`Laptop ${laptop.title} filtered out due to processor ${laptop.processor}`);
        return false;
      }
      
      if (filters.ram !== "all-ram" && laptop.ram && 
          !laptop.ram.toLowerCase().includes(filters.ram.toLowerCase())) {
        console.log(`Laptop ${laptop.title} filtered out due to RAM ${laptop.ram}`);
        return false;
      }
      
      if (filters.storage !== "all-storage" && laptop.storage && 
          !laptop.storage.toLowerCase().includes(filters.storage.toLowerCase())) {
        console.log(`Laptop ${laptop.title} filtered out due to storage ${laptop.storage}`);
        return false;
      }
      
      if (filters.graphics !== "all-graphics" && laptop.graphics && 
          !laptop.graphics.toLowerCase().includes(filters.graphics.toLowerCase())) {
        console.log(`Laptop ${laptop.title} filtered out due to graphics ${laptop.graphics}`);
        return false;
      }
      
      if (filters.screenSize !== "all-screens" && laptop.screen_size && 
          !laptop.screen_size.toLowerCase().includes(filters.screenSize.toLowerCase())) {
        console.log(`Laptop ${laptop.title} filtered out due to screen size ${laptop.screen_size}`);
        return false;
      }
      
      return true;
    });

    console.log(`Filtered from ${laptops.length} to ${filtered.length} laptops`);
    return filtered;
  };

  const sortLaptops = (laptops: Product[] | undefined) => {
    if (!laptops) {
      console.log('No laptops to sort');
      return [];
    }
    
    const sorted = [...laptops].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.current_price || 0) - (b.current_price || 0);
        case "price-desc":
          return (b.current_price || 0) - (a.current_price || 0);
        case "rating-desc":
          return ((b.rating || 0) * (b.rating_count || 0)) - 
                 ((a.rating || 0) * (a.rating_count || 0));
        case "performance-desc":
          return (b.processor_score || 0) - (a.processor_score || 0);
        default:
          return 0;
      }
    });

    console.log(`Sorted ${sorted.length} laptops by ${sortBy}`);
    return sorted;
  };

  const filteredAndSortedLaptops = sortLaptops(filterLaptops(laptops));
  console.log('Final filtered and sorted laptops:', filteredAndSortedLaptops?.length);

  const processors = getUniqueValues('processor');
  const ramSizes = getUniqueValues('ram');
  const storageOptions = getUniqueValues('storage');
  const graphicsCards = getUniqueValues('graphics');
  const screenSizes = getUniqueValues('screen_size');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm onSearch={setSearchAsin} />
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-64 flex-shrink-0">
              <div className="sticky top-32">
                <Card className="shadow-sm">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <LaptopFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      processors={processors}
                      ramSizes={ramSizes}
                      storageOptions={storageOptions}
                      graphicsCards={graphicsCards}
                      screenSizes={screenSizes}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-1">
              <LaptopToolbar
                totalLaptops={filteredAndSortedLaptops.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCollectLaptops={handleCollectLaptops}
                isLoading={isLaptopsLoading}
                isRefetching={isRefetching}
              />

              <LaptopList
                laptops={filteredAndSortedLaptops}
                isLoading={isLaptopsLoading}
                error={laptopsError}
                onRetry={handleRetry}
                isRefetching={isRefetching}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComparePriceLaptops;
