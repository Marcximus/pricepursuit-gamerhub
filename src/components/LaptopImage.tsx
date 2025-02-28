
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LaptopImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const LaptopImage: React.FC<LaptopImageProps> = ({
  src,
  alt,
  className,
  width = 300,
  height = 200,
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use a placeholder image if no source is provided
  const imageSrc = src || '/placeholder-laptop.png';

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {(isLoading || !src || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {hasError || !src ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Image not available
              </span>
            </div>
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-300", 
          isLoading ? "opacity-0" : "opacity-100"
        )}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

export default LaptopImage;
