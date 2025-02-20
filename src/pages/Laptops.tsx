
import { useState } from "react";
import { useProduct } from "@/hooks/useProduct";
import { useLaptops } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import type { Product } from "@/types/product";

type SortOption = "price-asc" | "price-desc" | "rating-desc" | "performance-desc";

const ComparePriceLaptops = () => {
  const [asin, setAsin] = useState("");
  const [searchAsin, setSearchAsin] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
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

  const sortedLaptops = sortLaptops(laptops);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Sort options only */}
          <div className="flex justify-end mb-8">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating-desc">Best Rated</SelectItem>
                <SelectItem value="performance-desc">Best Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Product search card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Amazon ASIN"
                  value={asin}
                  onChange={(e) => setAsin(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button type="submit" disabled={isProductLoading}>
                  {isProductLoading ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Product details if found */}
          {product && (
            <Card className="mb-8 overflow-hidden">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-auto rounded-lg"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">{product.title}</h3>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Specifications</h4>
                      <dl className="mt-2 space-y-2">
                        {product.processor && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Processor</dt>
                            <dd className="text-sm text-gray-900">{product.processor}</dd>
                          </div>
                        )}
                        {product.ram && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">RAM</dt>
                            <dd className="text-sm text-gray-900">{product.ram}</dd>
                          </div>
                        )}
                        {product.storage && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Storage</dt>
                            <dd className="text-sm text-gray-900">{product.storage}</dd>
                          </div>
                        )}
                        {product.screen_size && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Screen Size</dt>
                            <dd className="text-sm text-gray-900">{product.screen_size}</dd>
                          </div>
                        )}
                        {product.graphics && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Graphics</dt>
                            <dd className="text-sm text-gray-900">{product.graphics}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-600">
                        ${product.current_price?.toFixed(2)}
                      </p>
                      {product.original_price > product.current_price && (
                        <p className="text-sm text-gray-500 line-through">
                          ${product.original_price?.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-lg">
                        {product.rating} / 5 ({product.rating_count} reviews)
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => window.open(product.product_url, '_blank')}
                    >
                      View on Amazon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Laptops grid */}
          <section>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedLaptops.map((laptop) => (
                  <Card key={laptop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-w-16 aspect-h-9">
                      {laptop.image_url && (
                        <img
                          src={laptop.image_url}
                          alt={laptop.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{laptop.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {laptop.processor && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Processor:</span> {laptop.processor}
                            </p>
                          )}
                          {laptop.ram && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">RAM:</span> {laptop.ram}
                            </p>
                          )}
                          {laptop.storage && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Storage:</span> {laptop.storage}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            ${laptop.current_price?.toFixed(2)}
                          </p>
                          {laptop.original_price > laptop.current_price && (
                            <p className="text-sm text-gray-500 line-through">
                              ${laptop.original_price?.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>{laptop.rating} / 5</span>
                          <span className="mx-1">•</span>
                          <span>{laptop.rating_count} reviews</span>
                        </div>
                        <Button
                          className="w-full mt-4"
                          onClick={() => window.open(laptop.product_url, '_blank')}
                        >
                          View on Amazon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ComparePriceLaptops;
