
/**
 * Extracts generic processor information from a laptop title
 */
export const extractGenericProcessor = (normalizedTitle: string): string | null => {
  // Special handling for "Octa-core" processors
  if (normalizedTitle.includes('octa-core') || normalizedTitle.includes('octa core')) {
    // Look for processor model near the octa-core mention
    const octaContext = normalizedTitle.split(/\bocta[-\s]core\b/i);
    if (octaContext.length > 1) {
      // Look for model information after the octa-core mention
      const afterOcta = octaContext[1];
      
      // Check if there's an Intel i-series processor mentioned
      const intelMatch = afterOcta.match(/\bi([3579])[-]?(\d{4,5}[a-z]*)/i);
      if (intelMatch) {
        return `Intel Core i${intelMatch[1]}-${intelMatch[2]} (Octa-core)`;
      }
      
      // If no specific model, return generic octa-core
      if (normalizedTitle.includes('intel')) {
        return 'Intel Octa-core Processor';
      } else if (normalizedTitle.includes('amd')) {
        return 'AMD Octa-core Processor';
      }
    }
    return 'Octa-core Processor';
  }
  
  return null;
};
