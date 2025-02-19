
import { useState } from "react";
import { useProduct } from "@/hooks/useProduct";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

const LaptopsPage = () => {
  const [asin, setAsin] = useState("");
  const [searchAsin, setSearchAsin] = useState("");
  const { data: product, isLoading, error } = useProduct(searchAsin);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Laptop Price Comparison</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Laptop</CardTitle>
              <CardDescription>
                Enter an Amazon ASIN to track prices for a specific laptop model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter Amazon ASIN (e.g., B01NAKTA5M)"
                  value={asin}
                  onChange={(e) => setAsin(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Error</CardTitle>
                <CardDescription className="text-red-600">
                  Failed to fetch product data. Please try again.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {product && (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Current Price</h3>
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
                      <h3 className="text-lg font-semibold text-gray-900">Rating</h3>
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
        </div>
      </main>
    </div>
  );
};

export default LaptopsPage;
