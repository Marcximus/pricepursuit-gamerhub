
type LaptopPriceProps = {
  currentPrice: number | null;
  originalPrice: number | null;
  productUrl: string;
};

export function LaptopPrice({ currentPrice, originalPrice, productUrl }: LaptopPriceProps) {
  console.log('Rendering LaptopPrice:', { currentPrice, originalPrice });

  const formatPrice = (price: number | null) => {
    if (price === null || (typeof price === 'number' && isNaN(price))) {
      console.log('Invalid price value:', price);
      return 'Price not available';
    }
    return `$${price.toFixed(2)}`;
  };

  // If both prices are zero, it likely means they haven't been fetched yet
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
      {originalPrice && originalPrice > (currentPrice || 0) && (
        <div className="text-sm text-gray-500 line-through">
          {formatPrice(originalPrice)}
        </div>
      )}
    </a>
  );
}
