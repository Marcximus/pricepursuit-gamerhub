
import { type Product } from "@/types/product";
import { useState } from "react";

type LaptopImageProps = {
  title: string;
  imageUrl: string | null;
  productUrl: string;
};

export function LaptopImage({ title, imageUrl, productUrl }: LaptopImageProps) {
  // Default image URL if none is provided
  const defaultImageUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300";
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  return (
    <a 
      href={productUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block hover:opacity-90 transition-opacity relative"
    >
      {!isImageLoaded && !hasError && (
        <div className="w-32 h-32 bg-slate-100 flex items-center justify-center">
          <div className="animate-pulse w-8 h-8 rounded-full bg-slate-200"></div>
        </div>
      )}
      
      <img
        src={imageUrl || defaultImageUrl}
        alt={title || 'Laptop image'}
        className={`w-32 h-32 object-contain bg-gray-50 transition-opacity ${isImageLoaded && !hasError ? 'opacity-100' : 'opacity-0'} ${hasError ? 'hidden' : 'block'}`}
        onLoad={() => setIsImageLoaded(true)}
        onError={(e) => {
          console.log('Image failed to load, using default image');
          setHasError(true);
          const target = e.target as HTMLImageElement;
          target.src = defaultImageUrl;
          // Try to load the default image
          setTimeout(() => {
            setIsImageLoaded(true);
            setHasError(false);
          }, 100);
        }}
      />
      
      {hasError && (
        <div className="w-32 h-32 bg-slate-100 flex items-center justify-center">
          <img 
            src={defaultImageUrl}
            alt="Default laptop" 
            className="w-28 h-28 object-contain opacity-70"
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      )}
      
      {!imageUrl && (
        <span className="absolute bottom-0 right-0 bg-amber-500 text-white text-xs px-1 rounded">Missing Image</span>
      )}
    </a>
  );
}
