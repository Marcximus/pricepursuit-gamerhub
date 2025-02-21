
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaptopCard } from "@/components/laptops/LaptopCard";
import type { Product } from "@/types/product";

type LaptopListProps = {
  laptops: Product[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  isRefetching: boolean;
};

export function LaptopList({ 
  laptops, 
  isLoading, 
  error, 
  onRetry,
  isRefetching 
}: LaptopListProps) {
  // Add debug logging
  console.log('LaptopList render state:', {
    laptopCount: laptops?.length || 0,
    isLoading,
    hasError: !!error,
    isRefetching
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <ReloadIcon className="mx-auto h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    console.error('LaptopList error:', error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error</CardTitle>
          <CardDescription className="text-red-600">
            {error instanceof Error ? error.message : "Failed to fetch laptops. Please try again later."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="secondary" 
            onClick={onRetry}
            disabled={isRefetching}
          >
            {isRefetching ? "Retrying..." : "Try Again"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!laptops || laptops.length === 0) {
    console.log('No laptops available to display');
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Laptops Found</CardTitle>
          <CardDescription>
            Try updating the laptop data or adjusting your filters.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {laptops.map((laptop) => (
        <LaptopCard key={laptop.id} laptop={laptop} />
      ))}
    </div>
  );
}
