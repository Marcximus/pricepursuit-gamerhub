
import { BrandModelSpec } from "./specs/BrandModelSpec";
import { ProcessorSpec } from "./specs/ProcessorSpec";
import { GraphicsSpec } from "./specs/GraphicsSpec";
import { RamSpec } from "./specs/RamSpec";
import { ScreenSpec } from "./specs/ScreenSpec";
import { StorageSpec } from "./specs/StorageSpec";

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
        <BrandModelSpec 
          title={title}
          brand={brand}
          model={model}
        />
        <ScreenSpec 
          title={title}
          screenSize={specs.screenSize}
          screenResolution={specs.screenResolution}
        />
        <ProcessorSpec 
          title={title}
          processor={specs.processor}
        />
        <GraphicsSpec 
          title={title}
          graphics={specs.graphics}
        />
        <RamSpec 
          title={title}
          ram={specs.ram}
        />
        <StorageSpec 
          title={title}
          storage={specs.storage}
        />
      </ul>
    </div>
  );
}
