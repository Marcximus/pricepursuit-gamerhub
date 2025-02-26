
export const getProcessorValue = (processor: string): number => {
  let score = 0;
  
  const genMatch = processor.match(/(\d+)(?:th|rd|nd|st)?\s+Gen/i);
  if (genMatch) {
    score += parseInt(genMatch[1]) * 1000;
  }
  
  if (processor.includes('i9')) score += 9000;
  else if (processor.includes('i7')) score += 7000;
  else if (processor.includes('i5')) score += 5000;
  else if (processor.includes('i3')) score += 3000;
  else if (processor.includes('Ryzen 9')) score += 9000;
  else if (processor.includes('Ryzen 7')) score += 7000;
  else if (processor.includes('Ryzen 5')) score += 5000;
  else if (processor.includes('Ryzen 3')) score += 3000;
  else if (processor.includes('M3')) score += 9500;
  else if (processor.includes('M2')) score += 8500;
  else if (processor.includes('M1')) score += 7500;
  
  if (processor.includes('Apple')) score += 500;
  
  return score;
};

export const getGraphicsValue = (graphics: string): number => {
  let score = 0;
  
  if (graphics.includes('RTX 40')) score += 40000;
  else if (graphics.includes('RTX 30')) score += 30000;
  else if (graphics.includes('RTX 20')) score += 20000;
  else if (graphics.includes('RTX')) score += 15000;
  else if (graphics.includes('GTX 16')) score += 16000;
  else if (graphics.includes('GTX 10')) score += 10000;
  else if (graphics.includes('GTX')) score += 5000;
  else if (graphics.includes('Radeon RX')) score += 8000;
  else if (graphics.includes('Radeon')) score += 3000;
  else if (graphics.includes('Iris Xe')) score += 2000;
  else if (graphics.includes('UHD')) score += 1000;
  else if (graphics.includes('HD')) score += 500;
  
  const modelMatch = graphics.match(/\b(\d{4})\b/);
  if (modelMatch) {
    score += parseInt(modelMatch[1]);
  }
  
  return score;
};
