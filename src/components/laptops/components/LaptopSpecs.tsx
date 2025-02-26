
// Known laptop brands with proper capitalization
const BRAND_CORRECTIONS: {[key: string]: string} = {
  'apple': 'Apple',
  'lenovo': 'Lenovo',
  'hp': 'HP',
  'dell': 'Dell',
  'asus': 'ASUS',
  'acer': 'Acer',
  'msi': 'MSI',
  'samsung': 'Samsung',
  'microsoft': 'Microsoft',
  'lg': 'LG',
  'razer': 'Razer',
  'toshiba': 'Toshiba',
  'gigabyte': 'Gigabyte',
  'huawei': 'Huawei',
  'xiaomi': 'Xiaomi',
  'medion': 'Medion',
  'alienware': 'Alienware'
};

// Brand identification patterns to prevent incorrect brand detection
const BRAND_PATTERNS: {[key: string]: RegExp[]} = {
  'Apple': [/\bmacbook\b/i, /\bipad\b/i, /\bmac\b/i, /\bapple\b/i, /\bm1\b/i, /\bm2\b/i, /\bm3\b/i],
  'Lenovo': [/\blenovo\b/i, /\bthinkpad\b/i, /\bideapad\b/i, /\byoga\b/i, /\blegion\b/i],
  'HP': [/\bhp\b/i, /\bspectre\b/i, /\bpavilion\b/i, /\benvy\b/i, /\bomen\b/i, /\belitebook\b/i, /\bprobook\b/i],
  'Dell': [/\bdell\b/i, /\bxps\b/i, /\binspiron\b/i, /\blatitude\b/i, /\bprecision\b/i, /\bvostro\b/i],
  'ASUS': [/\basus\b/i, /\bzenbook\b/i, /\brog\b/i, /\btuf\b/i, /\bvivobook\b/i],
  'Acer': [/\bacer\b/i, /\baspire\b/i, /\bpredator\b/i, /\bnitro\b/i, /\bswift\b/i, /\bspin\b/i],
  'MSI': [/\bmsi\b/i, /\braider\b/i, /\bstealth\b/i, /\btitan\b/i, /\bprestige\b/i, /\bsword\b/i, /\bkatana\b/i],
  'Samsung': [/\bsamsung\b/i, /\bgalaxy book\b/i, /\bodyssey\b/i],
  'Microsoft': [/\bmicrosoft\b/i, /\bsurface\b/i],
  'Razer': [/\brazer\b/i, /\bblade\b/i],
  'Alienware': [/\balienware\b/i],
  'LG': [/\blg\b/i, /\bgram\b/i]
};

// Model name extraction patterns for each brand
const MODEL_PATTERNS: {[key: string]: RegExp} = {
  'Apple': /MacBook\s+(Air|Pro)(?:\s+(\d+\.?\d*)")?/i,
  'Lenovo': /(?:ThinkPad|IdeaPad|Yoga|Legion)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'HP': /(?:Pavilion|Envy|Spectre|Omen|EliteBook|ProBook)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Dell': /(?:XPS|Inspiron|Latitude|Precision|Vostro)\s+(\d+)(?:[A-Z0-9]+)?/i,
  'ASUS': /(?:ZenBook|VivoBook|ROG|TUF)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Acer': /(?:Aspire|Predator|Nitro|Swift|Spin)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'MSI': /(?:Stealth|Raider|Titan|Prestige|Sword|Katana)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i
};

// Detect the correct brand from the title, even if the stored brand is wrong
function detectBrandFromTitle(title: string, storedBrand: string | undefined): string {
  if (!title) return storedBrand || 'Unknown Brand';
  
  const titleLower = title.toLowerCase();
  
  // First, check if any brand patterns match
  for (const [brand, patterns] of Object.entries(BRAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(titleLower)) {
        return brand;
      }
    }
  }
  
  // If we get here, try to use the stored brand with correct capitalization
  if (storedBrand) {
    const normalizedBrand = storedBrand.toLowerCase().trim();
    return BRAND_CORRECTIONS[normalizedBrand] || storedBrand;
  }
  
  return 'Unknown Brand';
}

// Extract model name based on brand-specific patterns
function extractModelName(title: string, brand: string, storedModel: string | undefined): string {
  if (storedModel) return storedModel;
  if (!title || !brand) return '';
  
  // Use brand-specific pattern if available
  const pattern = MODEL_PATTERNS[brand];
  if (pattern) {
    const match = title.match(pattern);
    if (match) {
      if (match[2]) {
        return `${match[1]} ${match[2]}`;
      }
      return match[1];
    }
  }
  
  // Generic model extraction (get text after brand name until the next punctuation or number)
  const brandIndex = title.toLowerCase().indexOf(brand.toLowerCase());
  if (brandIndex >= 0) {
    const afterBrand = title.substring(brandIndex + brand.length).trim();
    const modelMatch = afterBrand.match(/^[:\s]*([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+){0,2})/);
    if (modelMatch) {
      return modelMatch[1];
    }
  }
  
  return '';
}

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
