
import { cn } from "@/lib/utils";

type LaptopPriceProps = {
  currentPrice: number | null;
  originalPrice: number | null;
  productUrl: string;
};

export function LaptopPrice({ currentPrice, originalPrice, productUrl }: LaptopPriceProps) {
  // Add detailed price logging
  console.log('LaptopPrice received:', { 
    currentPrice: currentPrice,
    originalPrice: originalPrice,
    hasValidCurrentPrice: currentPrice !== null && currentPrice > 0,
    hasValidOriginalPrice: originalPrice !== null && originalPrice > 0
  });

  const formatPrice = (price: number | null) => {
    if (price === null || price === 0) return 'Price not available';
    return `$${price.toFixed(2)}`;
  };

  const showDiscount = currentPrice && originalPrice && 
                      currentPrice > 0 && originalPrice > 0 && 
                      currentPrice < originalPrice;

  return (
    <a 
      href={productUrl}
      target="_blank" 
      rel="noopener noreferrer"
      className="block text-center"
    >
      <div className="flex flex-col items-center gap-1">
        <div className={cn(
          "text-xl font-bold",
          showDiscount ? "text-red-600" : "text-blue-600",
          (!currentPrice || currentPrice === 0) ? "text-gray-500" : ""
        )}>
          {formatPrice(currentPrice)}
        </div>
        
        {showDiscount && (
          <div className="text-sm text-gray-500 line-through">
            {formatPrice(originalPrice)}
          </div>
        )}
      </div>
    </a>
  );
}
