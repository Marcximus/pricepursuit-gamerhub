
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, className, ...props }, ref) => {
    const [error, setError] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    const handleError = () => {
      console.warn(`Image failed to load: ${src}`);
      setError(true);
      setLoading(false);
    };

    const handleLoad = () => {
      setLoading(false);
    };

    // Generate placeholder based on alt text if available
    const generatePlaceholder = () => {
      if (!alt) return '';
      
      // Get first letter of each word
      const initials = alt
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      return initials;
    };

    return (
      <>
        {loading && !error && (
          <div className="animate-pulse bg-gray-200 rounded-full w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-400">{generatePlaceholder()}</span>
          </div>
        )}
        
        <img
          ref={ref}
          src={error ? '/placeholder.svg' : src}
          alt={alt || ''}
          width={width}
          height={height}
          className={`${className} ${loading ? 'hidden' : 'block'}`}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
        
        {error && (
          <div className="bg-gray-100 rounded-full w-full h-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">{generatePlaceholder()}</span>
          </div>
        )}
      </>
    );
  }
);

Image.displayName = "Image";

export default Image;
