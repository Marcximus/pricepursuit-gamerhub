
/**
 * Normalizes laptop model names for consistency
 */

/**
 * Normalize model name for consistency
 */
export const normalizeModel = (
  storedModel: string,
  title: string,
  brand: string
): string => {
  // If stored model is already populated, use it
  if (storedModel && storedModel.trim().length > 0) {
    return storedModel.trim();
  }
  
  // Ensure we have valid inputs before proceeding
  if (!title || typeof title !== 'string') {
    return '';
  }
  
  // Make sure brand is never undefined when we try to call toLowerCase()
  const brandLower = brand && typeof brand === 'string' ? brand.toLowerCase() : '';
  const titleLower = title.toLowerCase();
  
  // Extract model from title based on brand-specific patterns
  let model = '';
  
  // Apple-specific model extraction
  if (brandLower === 'apple' || titleLower.includes('macbook') || titleLower.includes('apple')) {
    if (titleLower.includes('macbook pro')) {
      model = 'MacBook Pro';
      
      // Extract model year or size if available
      const yearMatch = title.match(/(\d{2}"|20\d{2})/);
      if (yearMatch) {
        model += ' ' + yearMatch[1];
      }
    } else if (titleLower.includes('macbook air')) {
      model = 'MacBook Air';
      
      // Extract model year or size if available
      const yearMatch = title.match(/(\d{2}"|20\d{2})/);
      if (yearMatch) {
        model += ' ' + yearMatch[1];
      }
    } else if (titleLower.includes('macbook')) {
      model = 'MacBook';
    }
    
    // Add M-series chip info if available
    const mChipMatch = titleLower.match(/m(\d+)(\s+pro|\s+max)?/);
    if (mChipMatch) {
      if (model) {
        model += ' with ';
      }
      model += 'M' + mChipMatch[1] + (mChipMatch[2] || '');
    }
  }
  // Dell-specific model extraction
  else if (brandLower === 'dell' || titleLower.includes('dell')) {
    const dellModelPatterns = [
      /(?:dell\s+)?xps\s+(\d+)/i,
      /(?:dell\s+)?inspiron\s+(\d+)/i,
      /(?:dell\s+)?latitude\s+(\w+\d+)/i,
      /(?:dell\s+)?precision\s+(\d+)/i,
      /(?:dell\s+)?g(\d+)/i
    ];
    
    for (const pattern of dellModelPatterns) {
      const match = title.match(pattern);
      if (match) {
        // Capitalize first letter of model name
        const modelPrefix = pattern.source.includes('xps') ? 'XPS' :
                            pattern.source.includes('inspiron') ? 'Inspiron' :
                            pattern.source.includes('latitude') ? 'Latitude' :
                            pattern.source.includes('precision') ? 'Precision' : 'G';
        
        model = modelPrefix + ' ' + match[1];
        break;
      }
    }
  }
  // HP-specific model extraction
  else if (brandLower === 'hp' || titleLower.includes('hp') || titleLower.includes('hewlett packard')) {
    const hpModelPatterns = [
      /(?:hp\s+)?spectre\s+(\w+)/i,
      /(?:hp\s+)?envy\s+(\d+)/i,
      /(?:hp\s+)?pavilion\s+(\d+)/i,
      /(?:hp\s+)?elitebook\s+(\w+)/i,
      /(?:hp\s+)?omen\s+(\d+)/i
    ];
    
    for (const pattern of hpModelPatterns) {
      const match = title.match(pattern);
      if (match) {
        // Capitalize first letter of model name
        const modelPrefix = pattern.source.includes('spectre') ? 'Spectre' :
                            pattern.source.includes('envy') ? 'ENVY' :
                            pattern.source.includes('pavilion') ? 'Pavilion' :
                            pattern.source.includes('elitebook') ? 'EliteBook' : 'OMEN';
        
        model = modelPrefix + ' ' + match[1];
        break;
      }
    }
  }
  // Lenovo-specific model extraction
  else if (brandLower === 'lenovo' || titleLower.includes('lenovo')) {
    const lenovoModelPatterns = [
      /(?:lenovo\s+)?thinkpad\s+(\w+\d+)/i,
      /(?:lenovo\s+)?yoga\s+(\d+)/i,
      /(?:lenovo\s+)?ideapad\s+(\d+)/i,
      /(?:lenovo\s+)?legion\s+(\d+)/i
    ];
    
    for (const pattern of lenovoModelPatterns) {
      const match = title.match(pattern);
      if (match) {
        // Capitalize first letter of model name
        const modelPrefix = pattern.source.includes('thinkpad') ? 'ThinkPad' :
                            pattern.source.includes('yoga') ? 'Yoga' :
                            pattern.source.includes('ideapad') ? 'IdeaPad' : 'Legion';
        
        model = modelPrefix + ' ' + match[1];
        break;
      }
    }
  }
  // ASUS-specific model extraction
  else if (brandLower === 'asus' || titleLower.includes('asus')) {
    const asusModelPatterns = [
      /(?:asus\s+)?zenbook\s+(\w+)/i,
      /(?:asus\s+)?vivobook\s+(\w+)/i,
      /(?:asus\s+)?rog\s+(\w+)/i,
      /(?:asus\s+)?tuf\s+(\w+)/i
    ];
    
    for (const pattern of asusModelPatterns) {
      const match = title.match(pattern);
      if (match) {
        // Capitalize first letter of model name
        const modelPrefix = pattern.source.includes('zenbook') ? 'ZenBook' :
                            pattern.source.includes('vivobook') ? 'VivoBook' :
                            pattern.source.includes('rog') ? 'ROG' : 'TUF';
        
        model = modelPrefix + ' ' + match[1];
        break;
      }
    }
  }
  
  // If no specific model pattern matched, try generic extraction
  if (!model) {
    // Look for model numbers that follow the brand name
    const genericModelPattern = new RegExp(brandLower + '\\s+([\\w-]+(?:\\s+[\\w-]+){0,2})', 'i');
    const match = genericModelPattern.exec(titleLower);
    
    if (match && match[1]) {
      model = match[1].trim();
      
      // Capitalize for better readability
      model = model.replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  return model || '';
};
