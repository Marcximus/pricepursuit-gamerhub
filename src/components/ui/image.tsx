
import React, { useState } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, className, ...props }, ref) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const defaultFallback = '/placeholder.svg';
    const unsplashFallback = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80';

    // Normalize Amazon URLs to get a more reliable image
    const normalizeImageUrl = (url: string | undefined): string => {
      if (!url) return defaultFallback;
      
      // Skip already processed URLs
      if (url.includes('unsplash.com') || url.startsWith('/')) {
        return url;
      }
      
      try {
        // Handle Amazon images to get the highest quality version
        if (url.includes('amazon.com') || url.includes('ssl-images-amazon.com')) {
          // Remove sizing parameters for Amazon images to get higher quality
          return url.replace(/\._.*_\./, '.'); // Remove size constraints like ._SL300_.
        }
        
        return url;
      } catch (e) {
        console.error('Error normalizing image URL:', e);
        return url;
      }
    };

    const processedSrc = normalizeImageUrl(src);
    
    const handleError = () => {
      console.log(`Image error loading: ${processedSrc}`);
      setError(true);
    };

    const handleLoad = () => {
      setLoaded(true);
    };

    return (
      <div className={`relative ${className || ''}`} style={{ width, height }}>
        {!loaded && !error && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        )}
        
        <img
          ref={ref}
          src={error ? unsplashFallback : processedSrc || defaultFallback}
          alt={alt || ''}
          width={width}
          height={height}
          className={`${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${error ? 'rounded-md object-contain' : ''}`}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
        
        {error && (
          <div className="absolute bottom-0 right-0 bg-amber-100 text-amber-800 text-xs px-1 py-0.5 rounded-tl-md">
            Fallback image
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = "Image";

export default Image;
