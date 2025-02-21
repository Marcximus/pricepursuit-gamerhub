
type LaptopSpecsProps = {
  title: string;
  productUrl: string;
  specs: {
    screenSize?: string;
    screenResolution?: string;
    processor?: string;
    graphics?: string;
    ram?: string;
    storage?: string;
    weight?: string;
    batteryLife?: string;
  };
};

export function LaptopSpecs({ title, productUrl, specs }: LaptopSpecsProps) {
  // Extract brand using regex pattern
  const brandPattern = /\b(HP|Dell|Lenovo|ASUS|Acer|Apple|Microsoft|MSI|Razer|Samsung|LG|Toshiba|Alienware|Gateway|Gigabyte|Huawei)\b/i;
  const brandMatch = title.match(brandPattern);
  const brand = brandMatch ? brandMatch[1] : 'Unknown Brand';

  return (
    <div>
      <a 
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:text-blue-600 transition-colors"
      >
        <h3 className="font-bold mb-2">{title || 'Untitled Laptop'}</h3>
      </a>
      <ul className="space-y-1 text-sm">
        <li>
          <span className="font-bold">Brand:</span>{" "}
          {brand}
        </li>
        <li>
          <span className="font-bold">Screen:</span>{" "}
          {specs.screenSize 
            ? `${specs.screenSize} ${specs.screenResolution ? `(${specs.screenResolution})` : ''}`
            : 'Not specified'}
        </li>
        <li>
          <span className="font-bold">Processor:</span>{" "}
          {specs.processor || 'Not specified'}
        </li>
        <li>
          <span className="font-bold">GPU:</span>{" "}
          {specs.graphics || 'Not specified'}
        </li>
        <li>
          <span className="font-bold">RAM:</span>{" "}
          {specs.ram || 'Not specified'}
        </li>
        <li>
          <span className="font-bold">Storage:</span>{" "}
          {specs.storage || 'Not specified'}
        </li>
        {specs.weight && (
          <li>
            <span className="font-bold">Weight:</span>{" "}
            {specs.weight}
          </li>
        )}
        {specs.batteryLife && (
          <li>
            <span className="font-bold">Battery Life:</span>{" "}
            {specs.batteryLife}
          </li>
        )}
      </ul>
    </div>
  );
}
