
import { ReloadIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaptopCard } from "@/components/laptops/LaptopCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product } from "@/types/product";

type LaptopListProps = {
  laptops: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isPartialData?: boolean;
  isFullDataLoaded?: boolean;
  error: Error | null;
  onRetry: () => void;
  isRefetching: boolean;
  onPageChange: (page: number) => void;
};

export function LaptopList({ 
  laptops, 
  totalCount,
  currentPage,
  totalPages,
  isLoading, 
  isPartialData,
  isFullDataLoaded,
  error, 
  onRetry,
  isRefetching,
  onPageChange
}: LaptopListProps) {
  console.log('LaptopList render state:', {
    laptopCount: laptops?.length || 0,
    totalCount,
    isLoading,
    isPartialData,
    isFullDataLoaded,
    hasError: !!error,
    isRefetching
  });

  if (isLoading && (!laptops || laptops.length === 0)) {
    return (
      <div className="text-center py-12">
        <ReloadIcon className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-600">Loading laptops...</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      {isPartialData && !isFullDataLoaded && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="flex items-center justify-between">
            <span>Loading full laptop catalog in the background...</span>
            <ReloadIcon className="h-4 w-4 animate-spin text-blue-500" />
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {laptops.map((laptop) => (
          <LaptopCard key={laptop.id} laptop={laptop} />
        ))}
      </div>

      {isRefetching && (
        <div className="text-center py-2">
          <ReloadIcon className="inline-block h-4 w-4 animate-spin text-gray-400 mr-2" />
          <span className="text-sm text-gray-500">Updating results...</span>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
