
import { memo } from "react";
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

// Memoize individual LaptopCard to prevent unnecessary re-renders
const MemoizedLaptopCard = memo(LaptopCard);

export function LaptopList({ 
  laptops, 
  isLoading, 
  error, 
  onRetry,
  isRefetching 
}: LaptopListProps) {
  if (error) {
    console.error('LaptopList error:', error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Laptops</CardTitle>
          <CardDescription className="text-red-600">
            {error instanceof Error ? error.message : "Failed to fetch laptops. Please try again later."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="secondary" 
            onClick={onRetry}
            disabled={isRefetching}
            className="w-full sm:w-auto"
          >
            {isRefetching ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Only show loading state on initial load, not during refetching
  if (isLoading && !laptops?.length) {
    return (
      <div className="text-center py-12">
        <ReloadIcon className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-600">Loading laptops...</p>
      </div>
    );
  }

  // Always show laptops if we have them, even during loading/refetching
  if (laptops?.length > 0) {
    // Use windowing if there are many laptops
    return (
      <div className="space-y-4">
        {laptops.map((laptop) => (
          <MemoizedLaptopCard key={laptop.id} laptop={laptop} />
        ))}
      </div>
    );
  }

  // Only show no laptops message if we're not loading and truly have no laptops
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Laptops Found</CardTitle>
        <CardDescription>
          Try updating the laptop data or adjusting your filters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onRetry}
          disabled={isRefetching}
        >
          {isRefetching ? "Updating..." : "Update Laptop Data"}
        </Button>
      </CardContent>
    </Card>
  );
}
