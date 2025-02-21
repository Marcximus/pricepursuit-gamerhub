
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

type LaptopCardProps = {
  laptop: Product;
};

export function LaptopCard({ laptop }: LaptopCardProps) {
  // Add more detailed console log to debug the data
  console.log('Laptop data for rendering:', {
    id: laptop.id,
    title: laptop.title,
    price: laptop.current_price,
    image: laptop.image_url,
    url: laptop.product_url
  });
  
  // Default image URL if none is provided
  const defaultImageUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300";
  
  // Construct the referral link
  const getProductUrl = () => {
    if (!laptop.product_url) return '#';
    const url = new URL(laptop.product_url);
    url.searchParams.set('tag', 'laptops-us-20'); // Updated Amazon Associates tag
    return url.toString();
  };

  const productUrl = getProductUrl();

  return (
    <Card className="flex p-4 gap-4 hover:shadow-lg transition-shadow">
      {/* Left side - Image and Price */}
      <div className="flex flex-col items-center gap-2 w-40">
        <a 
          href={productUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <img
            src={laptop.image_url || defaultImageUrl}
            alt={laptop.title || 'Laptop image'}
            className="w-32 h-32 object-contain bg-gray-50"
            onError={(e) => {
              console.log('Image failed to load, using default image');
              const target = e.target as HTMLImageElement;
              target.src = defaultImageUrl;
            }}
          />
          <div className="text-xl font-bold text-center mt-2 text-blue-600 hover:text-blue-800">
            {typeof laptop.current_price === 'number' && !isNaN(laptop.current_price)
              ? `£${laptop.current_price.toFixed(2)}` 
              : 'Price not available'}
          </div>
        </a>
      </div>

      {/* Right side - Specs */}
      <div className="flex-1">
        <a 
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-blue-600 transition-colors"
        >
          <h3 className="font-bold mb-2">{laptop.title || 'Untitled Laptop'}</h3>
        </a>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-bold">Screen:</span>{" "}
            {laptop.screen_size 
              ? `${laptop.screen_size} ${laptop.screen_resolution ? `(${laptop.screen_resolution})` : ''}`
              : 'Not specified'}
          </li>
          <li>
            <span className="font-bold">Processor:</span>{" "}
            {laptop.processor || 'Not specified'}
          </li>
          <li>
            <span className="font-bold">GPU:</span>{" "}
            {laptop.graphics || 'Not specified'}
          </li>
          <li>
            <span className="font-bold">RAM:</span>{" "}
            {laptop.ram || 'Not specified'}
          </li>
          <li>
            <span className="font-bold">Storage:</span>{" "}
            {laptop.storage || 'Not specified'}
          </li>
          {laptop.weight && (
            <li>
              <span className="font-bold">Weight:</span>{" "}
              {laptop.weight}
            </li>
          )}
          {laptop.battery_life && (
            <li>
              <span className="font-bold">Battery Life:</span>{" "}
              {laptop.battery_life}
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
}
