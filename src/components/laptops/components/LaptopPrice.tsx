
import { cn } from "@/lib/utils";

type LaptopPriceProps = {
  currentPrice: number | null;
  originalPrice: number | null;
  productUrl: string;
};

export function LaptopPrice({ currentPrice, originalPrice, productUrl }: LaptopPriceProps) {
  console.log('Rendering LaptopPrice with:', { currentPrice, originalPrice });

  const formatPrice = (price: number | null) => {
    if (price === null) return 'Price not available';
    return `$${price.toFixed(2)}`;
  };

  const showDiscount = currentPrice && originalPrice && currentPrice < originalPrice;

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
          showDiscount ? "text-red-600" : "text-blue-600"
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
