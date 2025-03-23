
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ComparisonSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="text-center">
        <Skeleton className="h-10 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      
      {/* Analysis section skeleton */}
      <Card className="overflow-hidden">
        <div className="bg-muted p-4">
          <Skeleton className="h-6 w-40 mx-auto" />
        </div>
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
      
      {/* Specifications section skeleton */}
      <Card className="overflow-hidden">
        <div className="bg-muted p-4">
          <Skeleton className="h-6 w-60 mx-auto" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-4">
              <Skeleton className="h-8 col-span-3" />
              <Skeleton className="h-8 col-span-2" />
              <Skeleton className="h-8 col-span-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ComparisonSkeleton;
