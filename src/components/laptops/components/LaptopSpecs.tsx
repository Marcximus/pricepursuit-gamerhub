
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";
import { normalizeModel } from "@/utils/laptop/valueNormalizer";

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
  };
  brand?: string;
  model?: string;
};

export function LaptopSpecs({ title, productUrl, specs, brand, model }: LaptopSpecsProps) {
  // Determine the correct brand using the normalizer
  const correctedBrand = normalizeBrand(brand || '', title);
  
  // Extract model name if not provided using the normalizer
  const displayModel = model || normalizeModel(null, title, correctedBrand);
  
  return (
    <div>
      <a 
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:text-blue-600 transition-colors"
      >
        <h3 className="font-bold mb-2 line-clamp-2">{title || 'Untitled Laptop'}</h3>
      </a>
      <ul className="space-y-1 text-sm">
        <li>
          <span className="font-bold">Brand:</span>{" "}
          {correctedBrand || 'Not Specified'}
        </li>
        {displayModel && (
          <li>
            <span className="font-bold">Model:</span>{" "}
            {displayModel}
          </li>
        )}
        <li>
          <span className="font-bold">Screen:</span>{" "}
          {specs.screenSize 
            ? `${specs.screenSize} ${specs.screenResolution ? `(${specs.screenResolution})` : ''}`
            : 'Not Specified'}
        </li>
        <li>
          <span className="font-bold">Processor:</span>{" "}
          {specs.processor || 'Not Specified'}
        </li>
        <li>
          <span className="font-bold">GPU:</span>{" "}
          {specs.graphics || 'Not Specified'}
        </li>
        <li>
          <span className="font-bold">RAM:</span>{" "}
          {specs.ram || 'Not Specified'}
        </li>
        <li>
          <span className="font-bold">Storage:</span>{" "}
          {specs.storage || 'Not Specified'}
        </li>
        {/* Removed weight display */}
      </ul>
    </div>
  );
}
