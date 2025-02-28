
/**
 * Calculates a numeric score for a graphics card based on its features and performance indicators
 */
export const getGraphicsValue = (graphics: string): number => {
  if (!graphics) return 0;
  
  const normalizedGraphics = graphics.toLowerCase();
  let score = 0;
  
  // NVIDIA discrete GPUs
  if (normalizedGraphics.includes('nvidia') || normalizedGraphics.includes('geforce') || 
      normalizedGraphics.includes('rtx') || normalizedGraphics.includes('gtx')) {
    
    if (normalizedGraphics.includes('rtx')) {
      score += 10000;
      if (normalizedGraphics.includes('rtx 40')) score += 40000;
      else if (normalizedGraphics.includes('rtx 30')) score += 30000;
      else if (normalizedGraphics.includes('rtx 20')) score += 20000;
      else score += 15000;
    } else if (normalizedGraphics.includes('gtx')) {
      score += 5000;
      if (normalizedGraphics.includes('gtx 16')) score += 16000;
      else if (normalizedGraphics.includes('gtx 10')) score += 10000;
      else score += 5000;
    }
    
    if (normalizedGraphics.includes('ti')) score += 1000;
  } else if (normalizedGraphics.includes('amd') || normalizedGraphics.includes('radeon')) {
    if (normalizedGraphics.includes('rx')) score += 8000;
    else score += 3000;
    
    if (normalizedGraphics.includes('rx 7')) score += 7000;
    else if (normalizedGraphics.includes('rx 6')) score += 6000;
    else if (normalizedGraphics.includes('rx 5')) score += 5000;
  } else if (normalizedGraphics.includes('intel')) {
    if (normalizedGraphics.includes('arc')) score += 6000;
    else if (normalizedGraphics.includes('iris xe')) score += 2000;
    else if (normalizedGraphics.includes('iris plus')) score += 1800;
    else if (normalizedGraphics.includes('iris')) score += 1500;
    else if (normalizedGraphics.includes('uhd')) score += 1000;
    else if (normalizedGraphics.includes('hd')) score += 500;
    else score += 100;
  } else if (normalizedGraphics.includes('apple') || normalizedGraphics.includes('m1') || 
             normalizedGraphics.includes('m2') || normalizedGraphics.includes('m3')) {
    score += 5000;
    
    if (normalizedGraphics.includes('m3')) score += 3000;
    else if (normalizedGraphics.includes('m2')) score += 2000;
    else if (normalizedGraphics.includes('m1')) score += 1000;
    
    if (normalizedGraphics.includes('ultra')) score += 300;
    else if (normalizedGraphics.includes('max')) score += 200;
    else if (normalizedGraphics.includes('pro')) score += 100;
  } else if (normalizedGraphics.includes('integrated')) {
    score += 50;
  }
  
  const modelNumber = normalizedGraphics.match(/\b(\d{4})\b/);
  if (modelNumber) {
    score += parseInt(modelNumber[1]);
  }
  
  return score;
};
