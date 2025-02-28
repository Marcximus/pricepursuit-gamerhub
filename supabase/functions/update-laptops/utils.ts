
import { LaptopUpdate } from './types'

/**
 * Extract laptop specifications from title and description
 */
export const extractLaptopSpecifications = (
  title: string | null,
  description: string | null
): Pick<LaptopUpdate, 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size'> => {
  // Combine title and description for searching
  const fullText = [title, description].filter(Boolean).join(' ')
  
  // Log the text being processed
  console.log('Extracting specifications from:', {
    titleLength: title?.length || 0,
    descriptionLength: description?.length || 0,
    sampleText: fullText?.substring(0, 100) + '...'
  })
  
  // Initialize specs
  const specs: Pick<LaptopUpdate, 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size'> = {
    processor: null,
    ram: null,
    storage: null,
    graphics: null,
    screen_size: null
  }
  
  if (!fullText) return specs
  
  // Extract processor information
  const processorPatterns = [
    /(?:Intel|AMD|Apple)[\s\-]?(?:Core)?[\s\-]?(?:i[3579]|Ryzen|Xeon|M1|M2|M3|A[0-9]+)[\s\-]?(?:[0-9A-Za-z]+)?/i,
    /(?:Intel|AMD|Apple)\s+(?:[A-Za-z0-9]+\s+)?(?:processor|CPU)/i,
    /(?:Snapdragon|MediaTek|Arm)\s+[0-9A-Za-z]+/i
  ]
  
  for (const pattern of processorPatterns) {
    const processorMatch = fullText.match(pattern)
    if (processorMatch && processorMatch[0]) {
      specs.processor = processorMatch[0].trim()
      console.log('Extracted processor:', specs.processor)
      break
    }
  }
  
  // Extract RAM information
  const ramPatterns = [
    /([0-9]+)\s*GB\s+(?:DDR[0-9]?)?\s*RAM/i,
    /([0-9]+)\s*GB\s+Memory/i,
    /RAM:\s*([0-9]+)\s*GB/i,
    /Memory:\s*([0-9]+)\s*GB/i
  ]
  
  for (const pattern of ramPatterns) {
    const ramMatch = fullText.match(pattern)
    if (ramMatch && ramMatch[1]) {
      specs.ram = `${ramMatch[1]}GB`
      console.log('Extracted RAM:', specs.ram)
      break
    }
  }
  
  // Extract storage information
  const storagePatterns = [
    /([0-9]+)\s*(?:GB|TB)\s+(?:SSD|HDD|eMMC|Flash)/i,
    /(?:SSD|HDD|Storage):\s*([0-9]+)\s*(?:GB|TB)/i,
    /([0-9]+)\s*(?:GB|TB)\s+(?:Storage|Drive)/i
  ]
  
  for (const pattern of storagePatterns) {
    const storageMatch = fullText.match(pattern)
    if (storageMatch && storageMatch[0]) {
      specs.storage = storageMatch[0].trim()
      console.log('Extracted storage:', specs.storage)
      break
    }
  }
  
  // Extract graphics information
  const graphicsPatterns = [
    /(?:NVIDIA|AMD|Intel)\s+(?:[A-Za-z]+\s+)?(?:RTX|GTX|RX|Arc|Radeon|GeForce)\s+[A-Za-z0-9]+/i,
    /(?:Intel|AMD)\s+(?:UHD|Iris|Radeon|Vega)\s+(?:Graphics|[0-9]+)/i,
    /(?:Apple|ARM)\s+(?:M[123]|Mali)\s+(?:GPU|Graphics)/i
  ]
  
  for (const pattern of graphicsPatterns) {
    const graphicsMatch = fullText.match(pattern)
    if (graphicsMatch && graphicsMatch[0]) {
      specs.graphics = graphicsMatch[0].trim()
      console.log('Extracted graphics:', specs.graphics)
      break
    }
  }
  
  // Extract screen size information
  const screenSizePatterns = [
    /([0-9]+(?:\.[0-9]+)?)\s*(?:"|inch|inches)\s+(?:display|screen)/i,
    /(?:display|screen):\s*([0-9]+(?:\.[0-9]+)?)\s*(?:"|inch|inches)/i,
    /([0-9]+(?:\.[0-9]+)?)\s*(?:"|inch|inches)/i
  ]
  
  for (const pattern of screenSizePatterns) {
    const screenMatch = fullText.match(pattern)
    if (screenMatch && screenMatch[1]) {
      specs.screen_size = `${screenMatch[1]}"`
      console.log('Extracted screen size:', specs.screen_size)
      break
    }
  }
  
  // Log extraction results
  console.log('Specification extraction results:', {
    processor: specs.processor,
    ram: specs.ram,
    storage: specs.storage,
    graphics: specs.graphics,
    screen_size: specs.screen_size,
    extractionSuccess: !!(specs.processor || specs.ram || specs.storage || specs.graphics || specs.screen_size)
  })
  
  return specs
}

/**
 * Extract a brand name from a laptop title
 */
export const extractBrand = (title: string | null): string | null => {
  if (!title) return null
  
  const knownBrands = [
    'Acer', 'Apple', 'ASUS', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'MSI', 
    'Razer', 'Samsung', 'Toshiba', 'LG', 'Alienware', 'Gigabyte', 
    'EVOO', 'Gateway', 'Chuwi', 'Huawei', 'Google', 'ACEMAGIC', 'VAIO'
  ]
  
  for (const brand of knownBrands) {
    if (title.includes(brand)) {
      return brand
    }
  }
  
  return null
}

/**
 * Extract a model name from a laptop title
 */
export const extractModel = (title: string | null, brand: string | null): string | null => {
  if (!title || !brand) return null
  
  // Try to extract model information after the brand name
  const modelRegex = new RegExp(`${brand}\\s+([A-Za-z0-9]+(?:\\s+[A-Za-z0-9]+)?)`, 'i')
  const modelMatch = title.match(modelRegex)
  
  if (modelMatch && modelMatch[1]) {
    return modelMatch[1].trim()
  }
  
  return null
}
