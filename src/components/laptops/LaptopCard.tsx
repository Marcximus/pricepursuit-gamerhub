
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

type LaptopCardProps = {
  laptop: Product;
};

export function LaptopCard({ laptop }: LaptopCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9">
        {laptop.image_url && (
          <img
            src={laptop.image_url}
            alt={laptop.title}
            className="w-full h-48 object-cover"
          />
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{laptop.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {laptop.processor && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Processor:</span> {laptop.processor}
              </p>
            )}
            {laptop.ram && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">RAM:</span> {laptop.ram}
              </p>
            )}
            {laptop.storage && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Storage:</span> {laptop.storage}
              </p>
            )}
            {laptop.graphics && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Graphics:</span> {laptop.graphics}
              </p>
            )}
            {laptop.screen_size && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Screen:</span> {laptop.screen_size}
              </p>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              ${laptop.current_price?.toFixed(2)}
            </p>
            {laptop.original_price > laptop.current_price && (
              <p className="text-sm text-gray-500 line-through">
                ${laptop.original_price?.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span>{laptop.rating} / 5</span>
            <span className="mx-1">•</span>
            <span>{laptop.rating_count} reviews</span>
          </div>
          <Button
            className="w-full mt-4"
            onClick={() => window.open(laptop.product_url, '_blank')}
          >
            View on Amazon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
