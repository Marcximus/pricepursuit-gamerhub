
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
    processedPrice: currentPrice ? `$${Math.round(currentPrice).toLocaleString()}` : 'Availability Unknown'
  });

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || (typeof price === 'number' && isNaN(price)) || price === 0) {
      console.log('Invalid price value:', price);
      return 'Availability Unknown';
    }
    return `$${Math.round(price).toLocaleString()}`;
  };

  // Handle case where price is null/undefined/0
  if (!currentPrice || currentPrice === 0) {
    return (
      <a 
        href={productUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="block text-center"
      >
        <div className="text-sm text-green-600 hover:text-green-800">
          Availability Unknown
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
      <div className="text-xl font-bold text-green-600 hover:text-green-800">
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
