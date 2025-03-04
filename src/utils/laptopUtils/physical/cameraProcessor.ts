
/**
 * Processes and normalizes webcam/camera information
 */
export const processCamera = (camera: string | undefined, title: string, description?: string): string | undefined => {
  if (camera && typeof camera === 'string' && !camera.includes('undefined')) {
    return camera.trim();
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for camera in the text using common camera patterns
  const cameraPatterns = [
    // Match HD/FHD camera mention
    /\b(HD|FHD|720p|1080p)\s*(?:webcam|camera)\b/i,
    
    // Match megapixel camera mention
    /\b(\d+(?:\.\d+)?MP|megapixel)\s*(?:webcam|camera)\b/i,
    
    // Match camera with special features
    /\b(?:IR|infrared|face recognition|windows hello)\s*(?:webcam|camera)\b/i,
    
    // Match privacy camera mentions
    /\b(?:privacy|physical shutter)\s*(?:webcam|camera)\b/i,
    
    // Match "with webcam" or similar
    /\bwith\s*(?:built-in|integrated)?\s*(?:webcam|camera)\b/i,
    
    // Match any webcam mention
    /\b(?:webcam|camera)\b/i,
  ];
  
  for (const pattern of cameraPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // Extract the camera spec
      let cameraSpec = match[0].trim();
      
      // Standardize common terms
      cameraSpec = cameraSpec
        .replace(/web\s*cam/i, 'webcam')
        .replace(/built-in|integrated/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Add HD if webcam is mentioned but no quality is specified
      if (cameraSpec.toLowerCase() === 'webcam' || cameraSpec.toLowerCase() === 'camera') {
        cameraSpec = 'HD Webcam';
      }
      
      return cameraSpec;
    }
  }
  
  // Check specifically for no webcam
  if (textToSearch.match(/\bno\s*(?:webcam|camera)\b/i)) {
    return 'No webcam';
  }
  
  return undefined;
};
