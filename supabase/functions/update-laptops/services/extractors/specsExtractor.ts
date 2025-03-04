
/**
 * Extract enhanced specifications from API response
 */
export function extractEnhancedSpecs(content: any, existingProduct: any): Record<string, any> {
  const specs: Record<string, any> = {};
  
  // Function to add spec if it doesn't exist or is different
  const addSpec = (field: string, value: any) => {
    if (value && (!existingProduct[field] || existingProduct[field] !== value)) {
      specs[field] = value;
    }
  };
  
  // Extract specifications from title
  if (content.title) {
    // Extract brand if missing
    if (!existingProduct.brand) {
      const brandMatch = content.title.match(/^(dell|hp|lenovo|asus|acer|apple|microsoft|razer|msi|samsung|lg)/i);
      if (brandMatch) {
        addSpec('brand', brandMatch[1].charAt(0).toUpperCase() + brandMatch[1].slice(1).toLowerCase());
      } else if (content.brand) {
        addSpec('brand', content.brand);
      }
    }
    
    // Extract processor if missing
    if (!existingProduct.processor) {
      const processorPatterns = [
        /intel\s+core\s+i[3579][\-\s]\d{4,5}(?:[A-Z])?/i,
        /ryzen\s+[3579]\s+\d{4}(?:[A-Z])?/i,
        /apple\s+m[123](?:\s+(?:pro|max|ultra))?/i
      ];
      
      for (const pattern of processorPatterns) {
        const match = content.title.match(pattern);
        if (match) {
          addSpec('processor', match[0]);
          break;
        }
      }
    }
    
    // Extract RAM if missing
    if (!existingProduct.ram) {
      const ramMatch = content.title.match(/(\d+)\s*GB\s+RAM/i);
      if (ramMatch) {
        addSpec('ram', `${ramMatch[1]} GB`);
      }
    }
    
    // Extract storage if missing
    if (!existingProduct.storage) {
      const storagePatterns = [
        /(\d+)\s*TB\s+(?:SSD|HDD|Storage)/i,
        /(\d+)\s*GB\s+(?:SSD|HDD|Storage)/i
      ];
      
      for (const pattern of storagePatterns) {
        const match = content.title.match(pattern);
        if (match) {
          if (pattern.source.includes('TB')) {
            addSpec('storage', `${match[1]} TB`);
          } else {
            addSpec('storage', `${match[1]} GB`);
          }
          break;
        }
      }
    }
    
    // Extract screen size if missing
    if (!existingProduct.screen_size) {
      const screenMatch = content.title.match(/(\d+\.?\d*)[\s"]*(?:inch|"|in)/i);
      if (screenMatch) {
        addSpec('screen_size', `${screenMatch[1]}"`);
      }
    }
    
    // Extract screen resolution if missing
    if (!existingProduct.screen_resolution) {
      const resolutionPatterns = [
        /(\d+)\s*x\s*(\d+)/i,
        /4K|UHD|QHD|FHD|1080p|1440p|2160p/i
      ];
      
      for (const pattern of resolutionPatterns) {
        const match = content.title.match(pattern);
        if (match) {
          addSpec('screen_resolution', match[0]);
          break;
        }
      }
    }
  }
  
  // Extract from product details if available
  if (content.product_details) {
    const details = content.product_details;
    
    // Map product details to fields
    const fieldMappings = [
      { source: 'processor_brand', target: 'processor' },
      { source: 'processor', target: 'processor' },
      { source: 'ram', target: 'ram' },
      { source: 'hard_drive', target: 'storage' },
      { source: 'graphics_coprocessor', target: 'graphics' },
      { source: 'card_description', target: 'graphics' },
      { source: 'standing_screen_display_size', target: 'screen_size' },
      { source: 'resolution', target: 'screen_resolution' },
      { source: 'screen_resolution', target: 'screen_resolution' },
      { source: 'operating_system', target: 'operating_system' },
      { source: 'item_weight', target: 'weight' },
      { source: 'brand', target: 'brand' },
      { source: 'series', target: 'model' }
    ];
    
    for (const mapping of fieldMappings) {
      if (details[mapping.source] && 
          typeof details[mapping.source] === 'string' && 
          details[mapping.source].trim().length > 0) {
        // Clean up the value (remove leading '‎' characters)
        const cleanValue = details[mapping.source].replace(/^‎/, '').trim();
        addSpec(mapping.target, cleanValue);
      }
    }
  }
  
  // Extract from bullet points if available
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletPoints = content.bullet_points;
    
    // Only extract from bullet points if we're still missing key specs
    if (!existingProduct.processor && !specs.processor) {
      const processorMatch = bulletPoints.match(/(?:Intel|AMD|Apple)[\s\w]+(?:i[3579][\-\s]\d{4,5}|Ryzen\s+[3579]\s+\d{4}|M[123](?:\s+(?:Pro|Max|Ultra))?)/i);
      if (processorMatch) {
        addSpec('processor', processorMatch[0]);
      }
    }
    
    if (!existingProduct.ram && !specs.ram) {
      const ramMatch = bulletPoints.match(/(\d+)\s*GB\s+(?:DDR\d+\s+)?RAM/i);
      if (ramMatch) {
        addSpec('ram', `${ramMatch[1]} GB`);
      }
    }
    
    if (!existingProduct.storage && !specs.storage) {
      const storageMatch = bulletPoints.match(/(\d+)\s*(?:TB|GB)\s+(?:SSD|HDD|PCIe|NVMe)/i);
      if (storageMatch) {
        addSpec('storage', storageMatch[0]);
      }
    }
    
    if (!existingProduct.graphics && !specs.graphics) {
      const graphicsMatch = bulletPoints.match(/(?:NVIDIA|Intel|AMD|Apple)[\s\w]+(?:Graphics|GTX|RTX|Radeon|Iris|UHD)/i);
      if (graphicsMatch) {
        addSpec('graphics', graphicsMatch[0]);
      }
    }
  }
  
  return specs;
}
