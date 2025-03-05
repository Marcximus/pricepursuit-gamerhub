
import React from 'react';

interface ProductImageProps {
  imageUrl?: string;
  altText: string;
  fallbackText?: string;
  url: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ 
  imageUrl, 
  altText, 
  fallbackText,
  url
}) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block overflow-hidden"
    >
      <div className="h-64 bg-gray-100 flex items-center justify-center p-6 overflow-hidden hover:bg-gray-50 transition-colors duration-300">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={altText} 
            className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="text-gray-400 text-center hover:text-gray-600 transition-colors">
            <p className="font-semibold mb-2">Image not available</p>
            <p className="text-sm">{fallbackText}</p>
          </div>
        )}
      </div>
    </a>
  );
};
