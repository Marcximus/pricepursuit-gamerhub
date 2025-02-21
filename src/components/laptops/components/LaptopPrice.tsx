
type LaptopPriceProps = {
  currentPrice: number | null;
  originalPrice: number | null; // Keeping prop for TypeScript compatibility but won't use it
  productUrl: string;
};

export function LaptopPrice({ currentPrice, productUrl }: LaptopPriceProps) {
  console.log('Rendering LaptopPrice:', { 
    currentPrice,
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

  // Handle case where price is null/undefined
  if (!currentPrice) {
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

  // Handle case where price is 0
  if (currentPrice === 0) {
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
    </a>
  );
}

