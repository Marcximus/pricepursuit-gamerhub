
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
    currentPriceType: typeof currentPrice
  });

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || (typeof price === 'number' && isNaN(price))) {
      console.log('Invalid price value:', price);
      return 'Price not available';
    }
    return `$${Math.floor(price)}`;
  };

  // Handle case where both prices are null/undefined
  if (!currentPrice && !originalPrice) {
    return (
      <a 
        href={productUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="block text-center"
      >
        <div className="text-sm text-gray-500">
          Price not available
        </div>
      </a>
    );
  }

  // Handle case where prices are 0
  if (currentPrice === 0 && originalPrice === 0) {
    return (
      <a 
        href={productUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="block text-center"
      >
        <div className="text-sm text-gray-500">
          Checking price...
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
