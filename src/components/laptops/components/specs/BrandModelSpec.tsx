
import { normalizeBrand, normalizeModel } from "@/utils/laptop/valueNormalizer";

type BrandModelSpecProps = {
  title: string;
  brand?: string;
  model?: string;
};

export function BrandModelSpec({ title, brand, model }: BrandModelSpecProps) {
  // Determine the correct brand using the normalizer
  const correctedBrand = normalizeBrand(brand || '', title);
  
  // Extract model name if not provided using the normalizer
  const displayModel = model || normalizeModel(null, title, correctedBrand);
  
  // Fix duplicate brands issue (like "LG LG")
  const fixedBrand = correctedBrand ? correctedBrand.trim() : 'Not Specified';
  
  // If the title starts with the brand, remove the brand from the display model to avoid duplication
  let cleanedModel = displayModel;
  if (displayModel && correctedBrand) {
    // First, handle exact duplicate brand (e.g., "LG LG")
    const brandRegex = new RegExp(`^${correctedBrand}\\s+${correctedBrand}\\s+`, 'i');
    cleanedModel = displayModel.replace(brandRegex, `${correctedBrand} `);
  }
  
  return (
    <>
      <li>
        <span className="font-bold">Brand:</span>{" "}
        {fixedBrand}
      </li>
      {cleanedModel && (
        <li>
          <span className="font-bold">Model:</span>{" "}
          {cleanedModel}
        </li>
      )}
    </>
  );
}
