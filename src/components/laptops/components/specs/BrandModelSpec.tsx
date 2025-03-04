
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
  
  // If the title starts with the brand, remove the brand from the display model to avoid duplication
  const cleanedModel = displayModel ? displayModel.replace(new RegExp(`^${correctedBrand}\\s+${correctedBrand}\\s+`, 'i'), `${correctedBrand} `) : displayModel;
  
  return (
    <>
      <li>
        <span className="font-bold">Brand:</span>{" "}
        {correctedBrand || 'Not Specified'}
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
