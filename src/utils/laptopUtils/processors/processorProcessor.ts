
/**
 * Functions for processing and normalizing processor information
 */

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
