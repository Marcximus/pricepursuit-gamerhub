
import React from 'react';
import { Laptop, RefreshCw } from 'lucide-react';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Laptop className="w-16 h-16 text-blue-500" />
        <RefreshCw className="w-8 h-8 text-blue-700 absolute -right-2 -top-2 animate-spin" />
      </div>
      <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-800">Finding the perfect laptops for you...</h3>
      <p className="text-gray-600 text-center max-w-sm">
        We're searching through our database to find the best laptops that match your requirements.
      </p>
      
      <div className="w-full max-w-md mt-8">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-blue-100">
            <div className="w-full h-full animate-pulse bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
