
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
  console.log('LaptopList render:', {
    laptopCount: laptops?.length || 0,
    isLoading,
    hasError: !!error,
    isRefetching
  });

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

  // Show loading state
  if (isLoading && (!laptops || laptops.length === 0)) {
    return (
      <div className="text-center py-12">
        <ReloadIcon className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-600">Loading laptops...</p>
      </div>
    );
  }

  // Return empty state only if we're not loading and have no laptops
  if (!isLoading && (!laptops || laptops.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Laptops Found</CardTitle>
          <CardDescription>
            Try updating your filters to see more laptops.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Render laptops
  return (
    <div className="space-y-4">
      {laptops.map((laptop) => (
        <LaptopCard key={laptop.id} laptop={laptop} />
      ))}
    </div>
  );
}
