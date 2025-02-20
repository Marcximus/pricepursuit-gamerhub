import { useState } from "react";
import { useProduct } from "@/hooks/useProduct";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ReloadIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaptopFilters, type FilterOptions } from "@/components/laptops/LaptopFilters";
import { LaptopSort, type SortOption } from "@/components/laptops/LaptopSort";
import { LaptopCard } from "@/components/laptops/LaptopCard";
import type { Product } from "@/types/product";

const ComparePriceLaptops = () => {
  const [asin, setAsin] = useState("");
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an Amazon ASIN",
      });
      return;
    }
    setSearchAsin(asin);
  };

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
    if (!laptops) return [];
    
    return laptops.filter(laptop => {
      const price = laptop.current_price || 0;
      if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
      
      if (filters.processor !== "all-processors" && laptop.processor && 
          !laptop.processor.toLowerCase().includes(filters.processor.toLowerCase())) return false;
      
      if (filters.ram !== "all-ram" && laptop.ram && 
          !laptop.ram.toLowerCase().includes(filters.ram.toLowerCase())) return false;
      
      if (filters.storage !== "all-storage" && laptop.storage && 
          !laptop.storage.toLowerCase().includes(filters.storage.toLowerCase())) return false;
      
      if (filters.graphics !== "all-graphics" && laptop.graphics && 
          !laptop.graphics.toLowerCase().includes(filters.graphics.toLowerCase())) return false;
      
      if (filters.screenSize !== "all-screens" && laptop.screen_size && 
          !laptop.screen_size.toLowerCase().includes(filters.screenSize.toLowerCase())) return false;
      
      return true;
    });
  };

  const sortLaptops = (laptops: Product[] | undefined) => {
    if (!laptops) return [];
    
    return [...laptops].sort((a, b) => {
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
  };

  const filteredAndSortedLaptops = sortLaptops(filterLaptops(laptops));

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
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar with Filters */}
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

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {!isLaptopsLoading && !laptopsError && (
                    `Found ${filteredAndSortedLaptops.length} laptops`
                  )}
                </div>
                <div className="flex gap-4 items-center">
                  <LaptopSort
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                  <Button
                    onClick={handleCollectLaptops}
                    disabled={isLaptopsLoading || isRefetching}
                    className="flex items-center gap-2"
                  >
                    {(isLaptopsLoading || isRefetching) ? (
                      <>
                        <ReloadIcon className="h-4 w-4 animate-spin" />
                        Collecting...
                      </>
                    ) : (
                      <>
                        <UpdateIcon className="h-4 w-4" />
                        Collect Laptops
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Main Content Area */}
              {isLaptopsLoading ? (
                <div className="text-center py-12">
                  <ReloadIcon className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : laptopsError ? (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">Error</CardTitle>
                    <CardDescription className="text-red-600">
                      {laptopsError instanceof Error ? laptopsError.message : "Failed to fetch laptops. Please try again later."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="secondary" 
                      onClick={handleRetry}
                      disabled={isRefetching}
                    >
                      {isRefetching ? "Retrying..." : "Try Again"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedLaptops.map((laptop) => (
                    <LaptopCard key={laptop.id} laptop={laptop} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComparePriceLaptops;
