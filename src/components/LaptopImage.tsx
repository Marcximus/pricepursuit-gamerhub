
import React, { useState, useEffect } from 'react';
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
  const [imageSrc, setImageSrc] = useState<string>('');
  
  useEffect(() => {
    if (!src) {
      setImageSrc('/placeholder-laptop.png');
      return;
    }
    
    // Process Amazon image URLs to get higher quality versions
    let processedSrc = src;
    
    try {
      if (src.includes('amazon.com') || src.includes('ssl-images-amazon.com')) {
        // Remove sizing parameters for Amazon images
        processedSrc = src.replace(/\._.*_\./, '.');
      }
    } catch (e) {
      console.error('Error processing image URL:', e);
    }
    
    setImageSrc(processedSrc);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {(isLoading || !imageSrc || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {hasError || !imageSrc ? (
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
          
          // Try to load an Unsplash fallback on error
          if (!imageSrc.includes('unsplash.com')) {
            setImageSrc('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200');
            setIsLoading(true);
            setHasError(false);
          }
        }}
      />
    </div>
  );
};

export default LaptopImage;
