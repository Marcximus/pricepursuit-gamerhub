
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
};

export function LaptopSpecs({ title, productUrl, specs }: LaptopSpecsProps) {
  // Extract brand using comprehensive regex pattern
  const brandPattern = /\b(Lenovo|HP|Dell|Apple|Acer|ASUS|Microsoft|Samsung|MSI|Razer|LG|Huawei|Dynabook|Toshiba|Gigabyte|Fujitsu|Panasonic|VAIO|Xiaomi|ThinkPad|IdeaPad|Pavilion|Inspiron|XPS|MacBook|Chromebook|ROG|Alienware|Predator|Swift|Aspire|Surface|Galaxy|GS|Blade|Gram|MateBook|LIFEBOOK|ToughBook|ProArt|Zenbook|Vivobook)\b|(?:^|\s)(Raider|Titan|Katana|Stealth|Creator|Modern|Prestige|Vector|Sword|Pulse|Alpha|Bravo|Delta)(?:\s|$)/i;
  
  // First try to find a direct brand match
  const brandMatch = title.match(brandPattern);
  let brand = brandMatch ? brandMatch[1] || brandMatch[2] : 'Unknown Brand';
  
  // If we matched an MSI model name, set brand to MSI
  if (brand && ['Raider', 'Titan', 'Katana', 'Stealth', 'Creator', 'Modern', 'Prestige', 'Vector', 'Sword', 'Pulse', 'Alpha', 'Bravo', 'Delta'].includes(brand)) {
    brand = 'MSI';
  }

  // Process model name patterns based on brand
  let modelName = '';
  if (brand !== 'Unknown Brand') {
    // Remove brand name and common prefixes from title
    let tempTitle = title.replace(new RegExp(`\\b${brand}\\b`, 'i'), '').trim();
    
    // Brand-specific model patterns
    const modelPatterns = {
      'HP': /\b(Pavilion|ProBook|EliteBook|Envy|Omen|Spectre|Stream)\b.*?(?=\s\d{4}|\s\(|$)/i,
      'Dell': /\b(Latitude|Inspiron|XPS|Precision|Vostro)\b.*?(?=\s\d{4}|\s\(|$)/i,
      'Lenovo': /\b(ThinkPad|IdeaPad|Legion|Yoga|Flex)\b.*?(?=\s\d{4}|\s\(|$)/i,
      'ASUS': /\b(ROG|TUF|ZenBook|VivoBook|ExpertBook|ProArt)\b.*?(?=\s\d{4}|\s\(|$)/i,
      'Acer': /\b(Aspire|Predator|Swift|Spin|Nitro|ConceptD)\b.*?(?=\s\d{4}|\s\(|$)/i,
      'MSI': /\b(Raider|Titan|Katana|Stealth|Creator|Modern|Prestige|Vector|Sword|Pulse|Alpha|Bravo|Delta)\b.*?(?=\s\d{4}|\s\(|$)/i,
    };

    // Try to match model pattern for the brand
    if (modelPatterns[brand]) {
      const modelMatch = tempTitle.match(modelPatterns[brand]);
      if (modelMatch) {
        modelName = modelMatch[0].trim();
      }
    }

    // If no specific model pattern matched, try to get next word after brand
    if (!modelName) {
      const generalModelMatch = tempTitle.match(/^\s*(\w+(?:\s+\w+)?)/);
      if (generalModelMatch) {
        modelName = generalModelMatch[1].trim();
      }
    }
  }

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
        {modelName && (
          <li>
            <span className="font-bold">Model:</span>{" "}
            {modelName}
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
