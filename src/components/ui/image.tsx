
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, className, ...props }, ref) => {
    const [error, setError] = React.useState(false);

    const handleError = () => {
      setError(true);
    };

    return (
      <img
        ref={ref}
        src={error ? '/placeholder.svg' : src}
        alt={alt || ''}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export default Image;
