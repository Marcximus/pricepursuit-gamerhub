
import { processProcessor, processRam, processStorage, processScreenResolution, 
        processRefreshRate, processTouchscreen, processOperatingSystem, 
        processColor, processWarranty, processOfficeIncluded, 
        processBacklitKeyboard, processPorts, processFingerprint } from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { processScreenSize, processWeight, processBatteryLife } from './physicalSpecsProcessor';

/**
 * Process laptop description to extract additional specifications
 * that might not be present in the title
 */
export const processLaptopDescription = (description: string | undefined, title: string, existingSpecs: any) => {
  if (!description || typeof description !== 'string' || description.length < 10) {
    return existingSpecs;
  }
  
  // Clean up description
  const cleanDescription = description
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Create a new specs object starting with existing specs
  const enhancedSpecs = { ...existingSpecs };
  
  // Try to extract missing specs from description
  if (!enhancedSpecs.processor) {
    enhancedSpecs.processor = processProcessor(undefined, title, cleanDescription);
  }
  
  if (!enhancedSpecs.ram) {
    enhancedSpecs.ram = processRam(undefined, title, cleanDescription);
  }
  
  if (!enhancedSpecs.storage) {
    enhancedSpecs.storage = processStorage(undefined, title, cleanDescription);
  }
  
  if (!enhancedSpecs.graphics) {
    enhancedSpecs.graphics = processGraphics(undefined, title + ' ' + cleanDescription);
  }
  
  if (!enhancedSpecs.screen_size) {
    enhancedSpecs.screen_size = processScreenSize(undefined, title + ' ' + cleanDescription);
  }
  
  if (!enhancedSpecs.screen_resolution) {
    enhancedSpecs.screen_resolution = processScreenResolution(undefined, title, cleanDescription);
  }
  
  if (!enhancedSpecs.weight) {
    enhancedSpecs.weight = processWeight(undefined, title + ' ' + cleanDescription);
  }
  
  if (!enhancedSpecs.battery_life) {
    enhancedSpecs.battery_life = processBatteryLife(undefined, title + ' ' + cleanDescription);
  }
  
  // Extract additional specs that might not be in the basic specs
  enhancedSpecs.refresh_rate = enhancedSpecs.refresh_rate || processRefreshRate(title, cleanDescription);
  enhancedSpecs.touchscreen = enhancedSpecs.touchscreen !== undefined ? 
                              enhancedSpecs.touchscreen : 
                              processTouchscreen(title, cleanDescription);
  enhancedSpecs.operating_system = enhancedSpecs.operating_system || processOperatingSystem(title, cleanDescription);
  enhancedSpecs.color = enhancedSpecs.color || processColor(title, cleanDescription);
  enhancedSpecs.warranty = enhancedSpecs.warranty || processWarranty(title, cleanDescription);
  enhancedSpecs.office_included = enhancedSpecs.office_included !== undefined ? 
                                  enhancedSpecs.office_included : 
                                  processOfficeIncluded(title, cleanDescription);
  enhancedSpecs.backlit_keyboard = enhancedSpecs.backlit_keyboard !== undefined ? 
                                   enhancedSpecs.backlit_keyboard : 
                                   processBacklitKeyboard(title, cleanDescription);
  enhancedSpecs.ports = enhancedSpecs.ports || processPorts(title, cleanDescription);
  enhancedSpecs.fingerprint = enhancedSpecs.fingerprint !== undefined ? 
                              enhancedSpecs.fingerprint : 
                              processFingerprint(title, cleanDescription);
  
  return enhancedSpecs;
};

// Helper function to determine if a laptop has premium features
export const hasPremiumFeatures = (specs: any): boolean => {
  // Check for premium processors
  const hasPremiumProcessor = specs.processor && (
    /i7|i9|ryzen 7|ryzen 9|M2 Pro|M2 Max|M3 Pro|M3 Max|Ultra/i.test(specs.processor)
  );
  
  // Check for high RAM
  const hasHighRam = specs.ram && (
    parseInt(specs.ram.replace(/GB.*/i, ''), 10) >= 16
  );
  
  // Check for SSD storage
  const hasSSD = specs.storage && (
    /SSD|NVMe|PCIe/i.test(specs.storage)
  );
  
  // Check for dedicated graphics
  const hasDedicatedGraphics = specs.graphics && (
    /RTX|GTX|RX|Radeon Pro/i.test(specs.graphics) && 
    !/Intel|AMD Radeon Graphics/i.test(specs.graphics)
  );
  
  // Check for high-res display
  const hasHighResDisplay = specs.screen_resolution && (
    /4K|UHD|QHD|2K|Retina/i.test(specs.screen_resolution)
  );
  
  // Check for premium features
  const hasPremiumFeatures = 
    (specs.touchscreen === true) ||
    (specs.backlit_keyboard === true) ||
    (specs.fingerprint === true) ||
    (specs.refresh_rate && specs.refresh_rate > 60);
  
  // A laptop is considered premium if it has at least 3 of the premium indicators
  let premiumScore = 0;
  if (hasPremiumProcessor) premiumScore++;
  if (hasHighRam) premiumScore++;
  if (hasSSD) premiumScore++;
  if (hasDedicatedGraphics) premiumScore++;
  if (hasHighResDisplay) premiumScore++;
  if (hasPremiumFeatures) premiumScore++;
  
  return premiumScore >= 3;
};
