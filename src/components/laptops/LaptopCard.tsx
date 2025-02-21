
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

type LaptopCardProps = {
  laptop: Product;
};

export function LaptopCard({ laptop }: LaptopCardProps) {
  // Add console log to debug the data
  console.log('Laptop data:', laptop);
  
  return (
    <Card className="flex p-4 gap-4 hover:shadow-lg transition-shadow">
      {/* Left side - Image and Price */}
      <div className="flex flex-col items-center gap-2 w-40">
        <img
          src={laptop.image_url || '/placeholder.svg'}
          alt={laptop.title || 'Laptop image'}
          className="w-32 h-32 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="text-xl font-bold">
          {laptop.current_price 
            ? `£${laptop.current_price.toFixed(2)}` 
            : 'Price not available'}
        </div>
      </div>

      {/* Right side - Specs */}
      <div className="flex-1">
        <h3 className="font-bold mb-2">{laptop.title || 'Untitled Laptop'}</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-bold">Screen:</span>{" "}
            {laptop.screen_size && `${laptop.screen_size} ${laptop.screen_resolution ? `(${laptop.screen_resolution})` : ''}`}
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
