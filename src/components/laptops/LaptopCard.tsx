
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Laptop, Battery, Weight, MonitorSmartphone } from "lucide-react";
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
            className="w-full h-36 object-cover"
          />
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium line-clamp-2">{laptop.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2 text-sm">
          {/* Price */}
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold text-green-600">
              ${laptop.current_price?.toFixed(2)}
            </span>
            {laptop.original_price > laptop.current_price && (
              <span className="text-xs text-gray-500 line-through">
                ${laptop.original_price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600">
            {/* Screen */}
            {laptop.screen_size && (
              <div className="flex items-center gap-1">
                <MonitorSmartphone className="h-3 w-3" />
                <span>{laptop.screen_size}</span>
              </div>
            )}

            {/* Processor */}
            {laptop.processor && (
              <div className="flex items-center gap-1">
                <Laptop className="h-3 w-3" />
                <span className="truncate" title={laptop.processor}>
                  {laptop.processor}
                </span>
              </div>
            )}

            {/* GPU */}
            {laptop.graphics && (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                  <path d="M12 12h.01" />
                  <path d="M16 12h.01" />
                  <path d="M8 12h.01" />
                </svg>
                <span className="truncate" title={laptop.graphics}>
                  {laptop.graphics}
                </span>
              </div>
            )}

            {/* RAM */}
            {laptop.ram && (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
                  <path d="M8 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M16 10h.01" />
                </svg>
                <span>{laptop.ram}</span>
              </div>
            )}

            {/* Storage */}
            {laptop.storage && (
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5Z" />
                  <path d="M7 7h.01" />
                  <path d="M17 7h.01" />
                  <path d="M7 17h.01" />
                  <path d="M17 17h.01" />
                </svg>
                <span>{laptop.storage}</span>
              </div>
            )}
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center text-xs text-gray-600">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(laptop.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="ml-1">({laptop.rating_count})</span>
          </div>

          <Button
            className="w-full text-xs h-8 mt-2"
            onClick={() => window.open(laptop.product_url, '_blank')}
          >
            View on Amazon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
