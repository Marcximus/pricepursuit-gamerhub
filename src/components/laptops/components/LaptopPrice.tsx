
type LaptopPriceProps = {
  currentPrice: number | null;
  originalPrice: number | null;
  productUrl: string;
};

export function LaptopPrice({ currentPrice, originalPrice, productUrl }: LaptopPriceProps) {
  const formatPrice = (price: number | null) => {
    if (typeof price !== 'number' || isNaN(price)) return 'Price not available';
    return `£${price.toFixed(2)}`;
  };

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
