
/**
 * Pattern definitions for different GPU manufacturers
 * Organized by brand for easier maintenance and updates
 */

// NVIDIA GPU patterns (from specific to general)
export const nvidiaPatterns = [
  // RTX 40-series (most recent)
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s*40\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-?Q)?\b/i,
  
  // RTX 30-series
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s*30\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-?Q)?\b/i,
  
  // RTX 20-series
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s*20\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-?Q)?\b/i,
  
  // GTX 16-series
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s*16\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-?Q)?\b/i,
  
  // GTX 10-series
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s*10\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-?Q)?\b/i,
  
  // Older GTX series
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s*\d{3,4}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-?Q)?\b/i,
  
  // Generic RTX/GTX mention with any potential model number
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX)\s*\d{1,4}[^\s]*\b/i,
  
  // Enhanced: Support for RTX with special characters like ™
  /\b(?:NVIDIA(?:®|\s+®)?\s+)?(?:GeForce(?:®|\s+®)?\s+)?RTX(?:™|\s+™)?\s*\d{1,4}[^\s]*\b/i,
  
  // NVIDIA MX series (entry-level dedicated)
  /\b(?:NVIDIA\s+)?(?:GeForce\s+)?MX\s*\d{3}(?:\s*Ti)?\b/i,
  
  // Any NVIDIA mention (fallback)
  /\bNVIDIA\s+(?!CPU|RAM|SSD|HDD|GB|TB|processor)[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?\b/i
];

// AMD GPU patterns (enhanced with more specific models)
export const amdPatterns = [
  // RX 7000 series
  /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*7\d{3}[A-Z]*(?:\s*XT)?\b/i,
  
  // RX 6000 series
  /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*6\d{3}[A-Z]*(?:\s*XT)?\b/i,
  
  // RX 5000 series
  /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*5\d{3}[A-Z]*(?:\s*XT)?\b/i,
  
  // Older RX series (500, 400)
  /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*[45]\d{2}[A-Z]*\b/i,
  
  // Vega series
  /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*Vega\s*\d*\b/i,
  
  // Generic RX series with any model number
  /\b(?:AMD\s+)?Radeon\s+RX\s*\d{1,4}[^\s]*\b/i,
  
  // Enhanced: Support for Radeon with special characters like ™
  /\b(?:AMD(?:®|\s+®)?\s+)?Radeon(?:™|\s+™)?(?:\s+RX)?\s*\d{1,4}[^\s]*\b/i,
  
  // Generic Radeon (likely integrated)
  /\b(?:AMD\s+)?Radeon\s+Graphics\b/i,
  
  // Enhanced: Multiple Radeon mentions in a row (common in some listings)
  /\b(?:AMD\s+)?(?:Radeon\s+){1,3}Graphics\b/i,
  
  // Any AMD graphics mention (fallback)
  /\bAMD\s+(?!CPU|RAM|SSD|HDD|GB|TB|processor|ryzen)[A-Za-z0-9]+(?:\s+Graphics)?\b/i
];

// Intel GPU patterns (enhanced)
export const intelPatterns = [
  // Intel Arc series (discrete)
  /\b(?:Intel\s+)?Arc\s+(?:A|Pro\s+A)?[1357]\d{2}\b/i,
  
  // Iris Xe (integrated but better) with specific G7/G4 variant
  /\b(?:Intel\s+)?Iris\s+Xe(?:\s+G[47])?\s*Graphics(?:\s*\d*)?\b/i,
  
  // Iris Plus/Pro (integrated)
  /\b(?:Intel\s+)?Iris\s+(?:Plus|Pro)\s*Graphics(?:\s*\d*)?\b/i,
  
  // UHD Graphics (common integrated) with generation number
  /\b(?:Intel\s+)?UHD\s*Graphics(?:\s+\d+)?\b/i,
  
  // HD Graphics (older integrated) with generation number
  /\b(?:Intel\s+)?HD\s*Graphics(?:\s+\d+)?\b/i,
  
  // Any Intel graphics mention (fallback)
  /\bIntel\s+(?!CPU|RAM|SSD|HDD|GB|TB|processor|core|celeron|pentium)[A-Za-z0-9]+\s+Graphics\b/i
];

// Apple silicon GPU patterns
export const applePatterns = [
  // M3 series (newest) with core count
  /\b(?:Apple\s+)?M3(?:\s+(?:Pro|Max|Ultra))?(?:\s+with\s+(?:\d+)-core\s+GPU)?\b/i,
  
  // M2 series with core count
  /\b(?:Apple\s+)?M2(?:\s+(?:Pro|Max|Ultra))?(?:\s+with\s+(?:\d+)-core\s+GPU)?\b/i,
  
  // M1 series with core count
  /\b(?:Apple\s+)?M1(?:\s+(?:Pro|Max|Ultra))?(?:\s+with\s+(?:\d+)-core\s+GPU)?\b/i
];
