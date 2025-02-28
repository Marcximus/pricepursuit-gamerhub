
import { normalizeBrand, BRAND_PATTERNS } from "@/utils/laptop/normalizers";
import { normalizeModel, MODEL_PATTERNS } from "@/utils/laptop/normalizers";

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
  
  // Helper function to display spec values with better fallbacks
  const formatSpec = (value: string | undefined, defaultText = "Unknown") => {
    if (!value || value.toLowerCase() === 'not specified') {
      return defaultText;
    }
    return value;
  };
  
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
          {correctedBrand || "Unknown"}
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
            ? `${formatSpec(specs.screenSize)} ${specs.screenResolution ? `(${formatSpec(specs.screenResolution)})` : ''}`
            : 'Unknown'}
        </li>
        <li>
          <span className="font-bold">Processor:</span>{" "}
          {formatSpec(specs.processor)}
        </li>
        <li>
          <span className="font-bold">GPU:</span>{" "}
          {formatSpec(specs.graphics)}
        </li>
        <li>
          <span className="font-bold">RAM:</span>{" "}
          {formatSpec(specs.ram)}
        </li>
        <li>
          <span className="font-bold">Storage:</span>{" "}
          {formatSpec(specs.storage)}
        </li>
        {specs.weight && (
          <li>
            <span className="font-bold">Weight:</span>{" "}
            {formatSpec(specs.weight)}
          </li>
        )}
      </ul>
    </div>
  );
}
