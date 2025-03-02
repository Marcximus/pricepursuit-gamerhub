
import { ReloadIcon, ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaptopCard } from "@/components/laptops/LaptopCard";
import type { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

type LaptopListProps = {
  laptops: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  isRefetching: boolean;
  onPageChange: (page: number) => void;
};

// Skeleton loader for laptop cards
const LaptopCardSkeleton = () => (
  <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-shrink-0">
        <Skeleton className="h-[180px] w-[180px] rounded-md" />
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="flex flex-wrap gap-2 pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  </div>
);

export function LaptopList({ 
  laptops, 
  totalCount,
  currentPage,
  totalPages,
  isLoading, 
  error, 
  onRetry,
  isRefetching,
  onPageChange
}: LaptopListProps) {
  console.log('LaptopList render state:', {
    laptopCount: laptops?.length || 0,
    totalCount,
    isLoading,
    hasError: !!error,
    isRefetching
  });

  // Show skeleton loaders during the initial load
  if (isLoading && (!laptops || laptops.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        {Array(5).fill(0).map((_, index) => (
          <LaptopCardSkeleton key={index} />
        ))}
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
      <div className="space-y-4">
        {isRefetching && (
          <div className="flex items-center justify-center py-2 bg-blue-50 text-blue-600 rounded-md mb-4">
            <ReloadIcon className="animate-spin h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Refreshing laptop data...</span>
          </div>
        )}
        
        {laptops.map((laptop) => (
          <LaptopCard key={laptop.id} laptop={laptop} />
        ))}
      </div>

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
