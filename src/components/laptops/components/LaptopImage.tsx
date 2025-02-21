
import { type Product } from "@/types/product";

type LaptopImageProps = {
  title: string;
  imageUrl: string | null;
  productUrl: string;
};

export function LaptopImage({ title, imageUrl, productUrl }: LaptopImageProps) {
  // Default image URL if none is provided
  const defaultImageUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300";
  
  return (
    <a 
      href={productUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block hover:opacity-90 transition-opacity"
    >
      <img
        src={imageUrl || defaultImageUrl}
        alt={title || 'Laptop image'}
        className="w-32 h-32 object-contain bg-gray-50"
        onError={(e) => {
          console.log('Image failed to load, using default image');
          const target = e.target as HTMLImageElement;
          target.src = defaultImageUrl;
        }}
      />
    </a>
  );
}
