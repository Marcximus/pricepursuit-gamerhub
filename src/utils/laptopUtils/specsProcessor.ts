
export const processProcessor = (processor: string | undefined, title: string, description?: string): string | undefined => {
  // First try to use existing processor information if valid
  if (processor && typeof processor === 'string' && !processor.includes('undefined')) {
    // Clean up existing processor string to remove unrelated specs 
    const cleanedProcessor = processor
      .replace(/(\d+\s*GB\s*(RAM|Memory|DDR\d*))/i, '')
      .replace(/(\d+\s*(GB|TB)\s*(SSD|HDD|Storage))/i, '')
      .replace(/(\d+(\.\d+)?\s*inch)/i, '')
      .replace(/\b(USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    if (cleanedProcessor.length > 3) {
      return cleanedProcessor;
    }
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for processor in the text (more specific patterns first)
  const processorPatterns = [
    // Match Apple M-series chips
    /\b(?:Apple\s*)?M[123]\s*(?:Pro|Max|Ultra)?\s*(?:chip)?\b/i,
    
    // Match full processor names with generation and model - expanded patterns
    /\b(?:Intel Core Ultra [579]|Intel Core i[3579]|AMD Ryzen [3579]|Intel Celeron|Intel Pentium Gold|Intel Pentium Silver|Intel Pentium|MediaTek|Qualcomm Snapdragon|Apple M[12])\s*(?:[A-Z0-9-]+(?:\s*[A-Z0-9]+)*(?:\s*HX)?)\b/i,
    
    // Match processor names with generation numbers
    /\b(?:i[3579]-\d{4,5}[A-Z]*(?:\s*HX)?|Ryzen\s*\d\s*\d{4}[A-Z]*(?:\s*HX)?|Core Ultra [579] [0-9]{3}[A-Z]*)\b/i,
    
    // Match processor with core count and generation
    /\b(?:\d{1,2}[-\s]Core\s+(?:i[3579]|Core Ultra)(?:[- ]\d{4,5}[A-Z]*)?)\b/i,
    
    // Match full processor description with thread counts
    /\b(?:(?:\d{1,2})[-\s]core,\s*(?:\d{1,2})[-\s]thread\s+(?:Intel|AMD))\b/i,
    
    // Match Intel 12th/13th Gen patterns
    /\b(?:(?:12|13|14)th[\s-]Gen\s+(?:Intel Core\s+)?i[3579][- ](?:\d{4,5}[A-Z]*)?)\b/i,
    
    // Match any Intel or AMD processor pattern - expanded coverage
    /\b(?:Intel|AMD)\s+(?:Core\s+Ultra|Core\s+)?(?:[A-Za-z]+(?:\s+[A-Za-z]+)*\s+)?(?:[0-9]+[A-Z]*(?:[ -][0-9]+[A-Z]*)?)\b/i,
    
    // Match Qualcomm and MediaTek processors
    /\b(?:Qualcomm\s+Snapdragon|MediaTek\s+Helio|MediaTek\s+Dimensity)\s+\d+[A-Z]*\b/i,
  ];
  
  for (const pattern of processorPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // Clean up and standardize processor name
      let processedName = match[0].trim()
        .replace(/\s+/g, ' ')  // Normalize spaces
        .replace(/intel core/i, 'Intel Core')
        .replace(/intel core ultra/i, 'Intel Core Ultra')
        .replace(/amd ryzen/i, 'AMD Ryzen')
        .replace(/\bi(\d)/i, 'Intel Core i$1')  // Expand i5 to Intel Core i5
        .replace(/apple\s*m(\d)/i, 'Apple M$1') // Standardize Apple M-series naming
        .replace(/qualcomm snapdragon/i, 'Qualcomm Snapdragon')
        .replace(/mediatek dimensity/i, 'MediaTek Dimensity')
        .replace(/mediatek helio/i, 'MediaTek Helio')
        .replace(/intel celeron/i, 'Intel Celeron')
        .replace(/intel pentium gold/i, 'Intel Pentium Gold')
        .replace(/intel pentium silver/i, 'Intel Pentium Silver')
        .replace(/intel pentium/i, 'Intel Pentium');
      
      // Remove duplicate "Intel Core" if present
      processedName = processedName.replace(/(Intel Core)\s+Intel Core/i, '$1');
      processedName = processedName.replace(/(Intel Core Ultra)\s+Intel Core Ultra/i, '$1');
      
      // Add "Intel Core" prefix if it's just an i-series number
      if (/^i[3579]/i.test(processedName)) {
        processedName = `Intel Core ${processedName}`;
      }
      
      // Add "Apple" prefix if it's just an M-series number
      if (/^M[123]/i.test(processedName)) {
        processedName = `Apple ${processedName}`;
      }
      
      // Add "chip" suffix for Apple processors if not present
      if (/Apple M[123]/i.test(processedName) && !processedName.toLowerCase().includes('chip')) {
        processedName = `${processedName} chip`;
      }
      
      // Add generation for Intel if present in title but not in processor name
      if (processedName.includes('Intel Core i') && !processedName.includes('Gen') && !processedName.includes('-')) {
        const genMatch = textToSearch.match(/\b(1[0-4]th)[\s-]Gen\b/i);
        if (genMatch) {
          processedName = `${genMatch[1]} Gen ${processedName}`;
        }
      }
      
      // Ensure the processor doesn't contain RAM or storage specs
      if (!/\d+\s*GB\s*(RAM|Memory|SSD|Storage)/i.test(processedName)) {
        return processedName;
      }
    }
  }
  
  // Advanced fallback: Look for any processor indicator when nothing else matches
  const fallbackMatch = textToSearch.match(/\b(?:processor|cpu):\s*([^,;.]*)/i);
  if (fallbackMatch && fallbackMatch[1] && fallbackMatch[1].length > 5) {
    const extractedProcessor = fallbackMatch[1].trim();
    // Only accept if it looks like a valid processor name
    if (/intel|amd|ryzen|core|celeron|pentium|snapdragon|mediatek|apple/i.test(extractedProcessor)) {
      return extractedProcessor;
    }
  }
  
  return undefined;
};

export const processRam = (ram: string | undefined, title: string, description?: string): string | undefined => {
  if (ram && typeof ram === 'string' && !ram.includes('undefined')) {
    // Clean up existing RAM string
    const cleanedRam = ram.trim().replace(/\s+/g, ' ');
    if (cleanedRam.length > 2) {
      return cleanedRam;
    }
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for RAM in the text (more specific patterns first)
  const ramPatterns = [
    // Match specific RAM mentions with DDR type
    /\b(\d+)\s*GB\s*(?:DDR[345]|LPDDR[345][X]?)\s*(?:RAM|Memory)?\b/i,
    
    // Match RAM with DDR type
    /\b(\d+)\s*GB\s*(?:DDR[345]|LPDDR[345][X]?)\b/i,
    
    // Match RAM with frequency
    /\b(\d+)\s*GB\s*(?:RAM|Memory)?\s*(?:@\s*\d+\s*MHz)?\b/i,
    
    // Match generic RAM mentions
    /\b(\d+)\s*GB\s*RAM\b/i,
    /\b(\d+)\s*GB\s*Memory\b/i,
    /\bRAM:\s*(\d+)\s*GB\b/i,
    /\bMemory:\s*(\d+)\s*GB\b/i,
    
    // Match RAM before storage or other specs
    /\b(\d+)\s*GB\b(?=.*(?:SSD|HDD|Storage|RAM))/i,
    
    // Match RAM mentioned early in specs
    /\b(\d+)\s*GB\b(?!.*(?:SSD|HDD|Storage|hard\s*drive))/i,
  ];
  
  for (const pattern of ramPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      const ramSize = match[1];
      
      // Validate RAM size to filter out unrealistic values
      const ramSizeNum = parseInt(ramSize, 10);
      if (ramSizeNum < 2 || ramSizeNum > 128) {
        continue; // Skip unrealistic RAM values
      }
      
      // Look for DDR type
      const ddrMatch = textToSearch.match(/\b(DDR[345](?:-\d+)?|LPDDR[345][X]?)(?:\s*@\s*(\d+)\s*MHz)?\b/i);
      
      // Compose RAM string with size and optional DDR type and frequency
      if (ddrMatch) {
        const ddrType = ddrMatch[1].toUpperCase();
        const frequency = ddrMatch[2] ? ` ${ddrMatch[2]}MHz` : '';
        return `${ramSize}GB ${ddrType}${frequency}`;
      }
      
      return `${ramSize}GB`;
    }
  }
  
  // Advanced fallback: check in description for any RAM mention
  if (description) {
    const descRamMatch = description.match(/\b(?:RAM|Memory)[:\s]+(\d+)\s*GB\b/i);
    if (descRamMatch) {
      const ramSize = parseInt(descRamMatch[1], 10);
      if (ramSize >= 2 && ramSize <= 128) { // Only accept realistic RAM values
        return `${ramSize}GB`;
      }
    }
  }
  
  return undefined;
};

export const processStorage = (storage: string | undefined, title: string, description?: string): string | undefined => {
  if (storage && typeof storage === 'string' && !storage.includes('undefined')) {
    // Clean up existing storage string
    const cleanedStorage = storage.trim().replace(/\s+/g, ' ');
    if (cleanedStorage.length > 4) {
      return cleanedStorage;
    }
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for storage in the text (more specific patterns first)
  const storagePatterns = [
    // Match specific SSD types with size
    /\b(\d+)\s*(?:GB|TB)\s*(?:Gen ?[1-5]|PCIe|NVMe|M\.2)?\s*SSD\b/i,
    
    // Match SSD with PCIE/NVME generation
    /\b(\d+)\s*(?:GB|TB)\s*(?:PCIe|NVMe)\s*(?:Gen ?[1-5])?\s*(?:x[24])?\s*(?:SSD|Storage)\b/i,
    
    // Match SSD/HDD with size and optional type
    /\b(\d+)\s*(?:GB|TB)\s*(?:Solid State Drive|Hard Drive|SSD|HDD|eMMC|Storage)\b/i,
    
    // Match storage keywords with sizes
    /\bStorage:?\s*(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|PCIe|NVMe|eMMC)?\b/i,
    /\b(?:SSD|HDD|Hard Drive):?\s*(\d+)\s*(?:GB|TB)\b/i,
    
    // Match storage mentions with Gen/PCIe/NVMe specification
    /\b(?:Gen ?[1-5]|PCIe|NVMe|M\.2)?\s*(\d+)\s*(?:GB|TB)\s*(?:SSD|Storage)\b/i,
    
    // Match general storage pattern after specific ones
    /\b(\d+)\s*(?:GB|TB)\s*(?:Storage|Drive)\b/i,
    
    // Match dual storage configurations
    /\b(\d+)\s*(?:GB|TB)\s*(?:SSD|PCIe|NVMe)\s*\+\s*(\d+)\s*(?:GB|TB)\s*(?:HDD|SSD)\b/i,
    
    // Generic storage pattern (use only if no other matches)
    /\b(\d+)\s*(?:GB|TB)\b(?!.*(?:RAM|Memory))/i, // Negative lookahead to avoid matching RAM
  ];
  
  for (const pattern of storagePatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // Check for dual storage configuration
      if (pattern.source.includes('\\+') && match[2]) {
        const primarySize = match[1];
        const primaryUnit = textToSearch.substring(match.index, match.index + 50).includes('TB') ? 'TB' : 'GB';
        
        const secondarySize = match[2];
        const secondaryUnit = textToSearch.substring(match.index + match[0].indexOf('+'), match.index + 50).includes('TB') ? 'TB' : 'GB';
        
        const primaryType = textToSearch.substring(match.index, match.index + match[0].indexOf('+')).includes('SSD') ? 'SSD' : 'HDD';
        const secondaryType = textToSearch.substring(match.index + match[0].indexOf('+'), match.index + 50).includes('SSD') ? 'SSD' : 'HDD';
        
        return `${primarySize}${primaryUnit} ${primaryType} + ${secondarySize}${secondaryUnit} ${secondaryType}`;
      }
      
      // Process single storage
      const size = match[1];
      const unit = match[0].includes('TB') ? 'TB' : 'GB';
      
      // Extract storage type information
      let type = 'SSD'; // Default to SSD for modern laptops
      let generation = '';
      
      const genMatch = textToSearch.match(/\bGen ?([1-5])\b/i);
      const typeMatch = textToSearch.match(/\b(?:PCIe|NVMe|M\.2)\b/i);
      
      if (genMatch) {
        generation = ` Gen ${genMatch[1]}`;
      }
      
      if (typeMatch) {
        type = `${typeMatch[0].toUpperCase()} ${type}`;
      }
      
      if (match[0].toLowerCase().includes('hdd') || match[0].toLowerCase().includes('hard drive')) {
        type = 'HDD';
      } else if (match[0].toLowerCase().includes('emmc')) {
        type = 'eMMC';
      } else if (!typeMatch && !match[0].toLowerCase().includes('ssd')) {
        // If no explicit storage type is mentioned, check if we can infer it
        if (parseInt(size, 10) >= 500 && unit === 'GB') {
          // Modern laptops with ≥500GB storage are likely to have SSD
          type = 'SSD';
        } else if (unit === 'TB') {
          // TB-sized storage could be either, but more likely SSD in newer laptops
          type = 'SSD';
        }
      }
      
      // Validate storage size is reasonable
      const sizeNum = parseInt(size, 10);
      if ((unit === 'GB' && sizeNum < 16) || (unit === 'TB' && sizeNum > 8)) {
        continue; // Skip unrealistic storage values
      }
      
      return `${size}${unit}${generation ? generation : ''} ${type}`.trim();
    }
  }
  
  // Advanced fallback: look for storage specifications in description
  if (description) {
    const descStorageMatch = description.match(/\b(?:storage|ssd|hard drive|hdd)[:\s]+(\d+)\s*(?:GB|TB)\b/i);
    if (descStorageMatch) {
      const storageSize = descStorageMatch[1];
      const storageUnit = descStorageMatch[0].toLowerCase().includes('tb') ? 'TB' : 'GB';
      
      // Detect storage type
      let storageType = 'SSD'; // Default to SSD for modern laptops
      if (descStorageMatch[0].toLowerCase().includes('hdd') || 
          descStorageMatch[0].toLowerCase().includes('hard drive')) {
        storageType = 'HDD';
      }
      
      return `${storageSize}${storageUnit} ${storageType}`;
    }
  }
  
  return undefined;
};

export const processScreenResolution = (resolution: string | undefined, title: string, description?: string): string | undefined => {
  if (resolution && typeof resolution === 'string' && !resolution.includes('undefined')) {
    return resolution;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for common resolution patterns
  const resolutionPatterns = [
    // Match specific resolution labels with numbers
    /\b(\d+x\d+|FHD\+?|QHD\+?|UHD\+?|4K|2K|1080p|720p)\b/i,
    
    // Match full resolution specifications
    /\b(\d+)\s*x\s*(\d+)\s*(?:resolution|pixels)?\b/i,
    
    // Match resolution types
    /\b(Full\s*HD|Quad\s*HD|Ultra\s*HD|HD\+|Full\s*HD\+|Retina)\b/i,
    
    // Match resolution with aspect ratio
    /\b(\d+x\d+|FHD\+?|QHD\+?|UHD\+?|4K)\s*\(\d+:\d+\)\b/i,
  ];
  
  for (const pattern of resolutionPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      let res = match[0];
      
      // Standardize resolution format
      res = res.replace(/full\s*hd/i, 'FHD')
               .replace(/quad\s*hd/i, 'QHD')
               .replace(/ultra\s*hd/i, 'UHD')
               .replace(/2k/i, 'QHD')
               .replace(/4k/i, 'UHD')
               .replace(/1080p/i, 'FHD')
               .replace(/720p/i, 'HD');
      
      // If we matched numbers, format them properly
      if (match[1] && match[2] && /\d+/.test(match[1]) && /\d+/.test(match[2])) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        
        // Validate that this looks like a real resolution
        if ((width > 1000 && width < 8000) && (height > 500 && height < 5000)) {
          return `${width}x${height}`;
        }
      }
      
      return res;
    }
  }
  
  // Try to infer resolution from common marketing terms
  if (textToSearch.match(/\bRetina\b/i)) {
    return 'Retina Display';
  }
  
  // Look for screen resolution in common formats
  const screenMatch = textToSearch.match(/\b(1920\s*[×x]\s*1080|2560\s*[×x]\s*1440|3840\s*[×x]\s*2160)\b/i);
  if (screenMatch) {
    const res = screenMatch[0].replace(/\s+/g, '').replace(/[×x]/i, 'x');
    if (res === '1920x1080') return 'FHD (1920x1080)';
    if (res === '2560x1440') return 'QHD (2560x1440)';
    if (res === '3840x2160') return 'UHD (3840x2160)';
    return res;
  }
  
  // If we have screen size but no resolution, try to infer common resolutions
  const sizeMatch = textToSearch.match(/\b1[0-9](\.[0-9])?\s*inch\b/i);
  if (sizeMatch) {
    if (textToSearch.match(/\bfhd\b/i)) return 'FHD (1920x1080)';
    if (textToSearch.match(/\bqhd\b/i)) return 'QHD (2560x1440)';
    if (textToSearch.match(/\buhd\b/i) || textToSearch.match(/\b4k\b/i)) return 'UHD (3840x2160)';
  }
  
  return undefined;
};

export const processRefreshRate = (title: string, description?: string): number | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for refresh rate patterns
  const refreshRatePatterns = [
    /\b(\d{2,3})\s*Hz\s*(?:refresh\s*rate)?\b/i,
    /\b(\d{2,3})Hz\b/i,
    /\brefresh\s*rate:?\s*(\d{2,3})(?:\s*Hz)?\b/i
  ];
  
  for (const pattern of refreshRatePatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const rate = parseInt(match[1], 10);
      // Validate that this is a realistic refresh rate for a laptop
      if (rate >= 60 && rate <= 360) {
        return rate;
      }
    }
  }
  
  return undefined;
};

export const processTouchscreen = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for touchscreen indicators
  const touchPatterns = [
    /\b(?:touchscreen|touch\s*screen|touch\s*display|touch\s*enabled)\b/i,
    /\b(?:touch|touchscreen)(?:-|\s*)(?:enabled|capable|ready)\b/i
  ];
  
  for (const pattern of touchPatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  // Specific models known to be touchscreen
  if (textToSearch.match(/\b(?:Surface|Yoga|Flex|Spectre x360|Envy x360|XPS 2-in-1|Flip)\b/i)) {
    if (textToSearch.match(/\b(?:2-in-1|convertible|360|tablet\s*mode)\b/i)) {
      return true;
    }
  }
  
  // If not explicitly mentioned, we can't determine
  return undefined;
};

export const processOperatingSystem = (title: string, description?: string): string | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for OS patterns
  const osPatterns = [
    /\b(?:Windows|Win)\s*(?:11|10)\s*(?:Home|Pro|Education|Enterprise|S\s*Mode)?\b/i,
    /\b(?:macOS|OS\s*X|MacOS)\b/i,
    /\b(?:Chrome\s*OS|ChromeOS)\b/i,
    /\b(?:Linux|Ubuntu|Fedora|Debian)\b/i,
    /\b(?:DOS|FreeDOS)\b/i
  ];
  
  for (const pattern of osPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      let os = match[0].trim();
      
      // Standardize OS names
      os = os.replace(/\bWin\s*11\b/i, 'Windows 11')
             .replace(/\bWin\s*10\b/i, 'Windows 10')
             .replace(/\bOS\s*X\b/i, 'macOS');
      
      // Add Home/Pro for Windows if not specified
      if (os.match(/\bWindows\s*\d+\b/i) && !os.match(/Home|Pro|Education|Enterprise|S\s*Mode/i)) {
        if (os.toLowerCase().includes('pro') || textToSearch.toLowerCase().includes('business')) {
          os += ' Pro';
        } else {
          os += ' Home';
        }
      }
      
      return os;
    }
  }
  
  // For Apple products, default to macOS
  if (textToSearch.match(/\b(?:MacBook|Mac\s*Book|Apple)\b/i)) {
    return 'macOS';
  }
  
  // Default for most laptops is Windows
  if (!textToSearch.match(/\b(?:Chrome\s*Book|ChromeOS)\b/i)) {
    return 'Windows';
  }
  
  return undefined;
};

// A new function to extract and process color information
export const processColor = (title: string, description?: string): string | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Common laptop colors
  const colorPatterns = [
    /\b(?:Silver|Gray|Grey|Black|White|Gold|Blue|Red|Pink|Purple|Green|Bronze|Copper|Rose\s*Gold|Space\s*Gray|Midnight|Starlight)\b/i,
    /\b(?:Obsidian|Platinum|Arctic|Onyx|Frost|Slate|Carbon|Shadow|Cosmic|Galaxy|Mystic)\s*(?:Silver|Gray|Grey|Black|Blue)?\b/i,
    /\bAluminum\s*(?:Silver|Gray|Grey)?\b/i,
    /\bColor:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b/i
  ];
  
  for (const pattern of colorPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // If we matched a "Color: X" pattern, use X
      if (match[1]) {
        // Skip non-color words often found after "Color:"
        const nonColorWords = /laptop|computer|fast|performance|high|new|latest/i;
        if (!nonColorWords.test(match[1])) {
          return match[1].trim();
        }
      } else {
        return match[0].trim();
      }
    }
  }
  
  return undefined;
};

// Function to extract warranty information
export const processWarranty = (title: string, description?: string): string | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for warranty patterns
  const warrantyPatterns = [
    /\b(\d+)[\s-](?:Year|Yr)s?\s*(?:Warranty|Limited\s*Warranty)\b/i,
    /\bWarranty:?\s*(\d+)[\s-](?:Year|Yr)s?\b/i,
    /\b(\d+)[\s-](?:Year|Yr)s?\s*(?:Manufacturer['']?s?\s*Warranty)\b/i
  ];
  
  for (const pattern of warrantyPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1], 10);
      if (years > 0 && years <= 5) { // Reasonable warranty periods
        return `${years} Year${years > 1 ? 's' : ''}`;
      }
    }
  }
  
  return undefined;
};

// Function to detect if laptop includes Microsoft Office
export const processOfficeIncluded = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Check for Microsoft Office mentions
  const officePatterns = [
    /\b(?:Microsoft|MS)\s*Office\s*(?:Home|Student|Professional|Business|365)?\s*(?:20\d\d|Included|Pre-installed)\b/i,
    /\b(?:Includes|Bundled\s*with|With)\s*(?:Microsoft|MS)\s*Office\b/i,
    /\bOffice\s*(?:Home|Student|Professional|Business|365)?\s*(?:20\d\d|Included|License)\b/i
  ];
  
  for (const pattern of officePatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  return undefined;
};

// Extend the existing function to detect backlit keyboard
export const processBacklitKeyboard = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Check for backlit keyboard mentions
  const backlitPatterns = [
    /\b(?:backlit|backlight(?:ed)?)\s*(?:keyboard|keys|key\s*board)\b/i,
    /\b(?:keyboard\s*with\s*backlight(?:ing)?)\b/i,
    /\bKB\s*Backlight(?:ed)?\b/i,
    /\bBacklit\s*KB\b/i
  ];
  
  for (const pattern of backlitPatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  return undefined;
};

// Function to extract number of ports (USB, HDMI, etc.)
export const processPorts = (title: string, description?: string): Record<string, number> | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  const ports: Record<string, number> = {};
  
  // Check for USB ports (all types)
  const usbPatterns = [
    /\b(\d+)\s*(?:x\s*)?USB(?:\s*Type[\s-])?(?:A|C)?\s*(?:3\.[01]|3|2\.0|2)?\b/i,
    /\bUSB(?:\s*Type[\s-])?(?:A|C)?\s*(?:3\.[01]|3|2\.0|2)?\s*(?:x\s*)?(\d+)\b/i,
    /\b(\d+)\s*USB(?:\s*Type[\s-])?(?:A|C)?\s*ports\b/i
  ];
  
  // Check for HDMI ports
  const hdmiPatterns = [
    /\b(\d+)\s*(?:x\s*)?HDMI\b/i,
    /\bHDMI\s*(?:x\s*)?(\d+)\b/i,
    /\bHDMI\s*port(?:s)?\b/i
  ];
  
  // Check for Thunderbolt ports
  const thunderboltPatterns = [
    /\b(\d+)\s*(?:x\s*)?Thunderbolt\s*(?:3|4)?\b/i,
    /\bThunderbolt\s*(?:3|4)?\s*(?:x\s*)?(\d+)\b/i,
    /\bThunderbolt\s*(?:3|4)?\s*port(?:s)?\b/i
  ];
  
  // Extract USB ports
  for (const pattern of usbPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count <= 10) { // Reasonable number of ports
        ports.USB = (ports.USB || 0) + count;
      }
    } else if (textToSearch.match(/\bUSB\b/i)) {
      // If USB is mentioned but no count, assume at least 1
      ports.USB = (ports.USB || 0) + 1;
    }
  }
  
  // Extract HDMI ports
  for (const pattern of hdmiPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count <= 4) { // Reasonable number of HDMI ports
        ports.HDMI = count;
      }
    } else if (textToSearch.match(/\bHDMI\b/i)) {
      // If HDMI is mentioned but no count, assume 1
      ports.HDMI = 1;
    }
  }
  
  // Extract Thunderbolt ports
  for (const pattern of thunderboltPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count <= 4) { // Reasonable number of Thunderbolt ports
        ports.Thunderbolt = count;
      }
    } else if (textToSearch.match(/\bThunderbolt\b/i)) {
      // If Thunderbolt is mentioned but no count, assume 1
      ports.Thunderbolt = 1;
    }
  }
  
  // Only return if we found any ports
  return Object.keys(ports).length > 0 ? ports : undefined;
};

// Function to extract fingerprint reader information
export const processFingerprint = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Check for fingerprint reader mentions
  const fingerprintPatterns = [
    /\b(?:fingerprint|finger\s*print)\s*(?:reader|scanner|sensor)\b/i,
    /\bFP\s*(?:reader|scanner|sensor)\b/i,
    /\bTouch\s*(?:ID|Identity)\b/i
  ];
  
  for (const pattern of fingerprintPatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  return undefined;
};
