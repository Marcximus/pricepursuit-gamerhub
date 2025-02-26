
import { detectBrandFromTitle } from "@/utils/laptopUtils/brandUtils";
import { extractModelName } from "@/utils/laptopUtils/modelUtils";

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
  // Determine the correct brand - first try to detect from title (most reliable),
  // then fall back to the provided brand with corrections
  const correctedBrand = detectBrandFromTitle(title, brand);
  
  // Extract model name if not provided
  const displayModel = model || extractModelName(title, correctedBrand, model);
  
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
          {correctedBrand}
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
      </ul>
    </div>
  );
}

