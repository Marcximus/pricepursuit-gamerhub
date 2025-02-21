
type LaptopPriceProps = {
  currentPrice: number | null;
  originalPrice: number | null;
  productUrl: string;
};

export function LaptopPrice({ currentPrice, originalPrice, productUrl }: LaptopPriceProps) {
  console.log('Rendering LaptopPrice:', { 
    currentPrice,
    originalPrice,
    hasCurrentPrice: currentPrice !== null && currentPrice !== undefined,
    currentPriceType: typeof currentPrice,
    processedPrice: currentPrice ? `$${currentPrice.toFixed(2)}` : 'N/A'
  });

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || (typeof price === 'number' && isNaN(price))) {
      console.log('Invalid price value:', price);
      return 'Price not available';
    }
    return `$${price.toFixed(2)}`;
  };

  // Handle case where price is null/undefined
  if (!currentPrice) {
    return (
      <a 
        href={productUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="block text-center"
      >
        <div className="text-sm text-red-500">
          Price not available
        </div>
      </a>
    );
  }

  // Handle case where price is 0
  if (currentPrice === 0) {
    return (
      <a 
        href={productUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="block text-center"
      >
        <div className="text-sm text-red-500">
          Price unavailable - ASIN needs update
        </div>
      </a>
    );
  }

  return (
    <a 
      href={productUrl}
      target="_blank" 
      rel="noopener noreferrer"
      className="block text-center"
    >
      <div className="text-xl font-bold text-blue-600 hover:text-blue-800">
        {formatPrice(currentPrice)}
      </div>
      {originalPrice && originalPrice > currentPrice && (
        <div className="text-sm text-gray-500 line-through">
          {formatPrice(originalPrice)}
        </div>
      )}
    </a>
  );
}
