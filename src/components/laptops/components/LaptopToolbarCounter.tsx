
import React from "react";

type LaptopToolbarCounterProps = {
  isLoading: boolean;
  isRefetching: boolean;
  totalLaptops: number;
  children?: React.ReactNode;
};

export function LaptopToolbarCounter({
  isLoading,
  isRefetching,
  totalLaptops,
  children
}: LaptopToolbarCounterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-slate-700">
      <span className="text-sm font-medium">
        {isLoading || isRefetching ? 'Loading...' : `${totalLaptops} laptops found`}
      </span>
      {children}
    </div>
  );
}
