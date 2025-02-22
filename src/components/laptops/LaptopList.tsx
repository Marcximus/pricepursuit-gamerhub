
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
  // Show loading state only on initial load, not during refetching
  if (isLoading && !laptops?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Laptops</CardTitle>
          <CardDescription>Please wait while we fetch the latest laptop data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <ReloadIcon className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Laptops</CardTitle>
          <CardDescription className="text-red-600">
            {error instanceof Error ? error.message : "Failed to fetch laptops"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="secondary" 
            onClick={onRetry}
            disabled={isRefetching}
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

  // Show empty state
  if (!laptops || laptops.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Laptop Data</CardTitle>
          <CardDescription>
            Please wait while we collect the latest laptop information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <ReloadIcon className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show laptops list
  return (
    <div className="space-y-4">
      {/* Show a subtle loading indicator for background updates */}
      {isRefetching && (
        <div className="flex items-center justify-center py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          Updating data in background...
        </div>
      )}
      
      {/* Display laptops */}
      <div className="space-y-4">
        {laptops.map((laptop) => (
          <LaptopCard key={laptop.id} laptop={laptop} />
        ))}
      </div>
    </div>
  );
}
