
// Format ratings consistently and handle comparison
export const formatRating = (rating: number | null | undefined): string => {
  if (!rating) return 'N/A';
  return `${rating.toFixed(1)}/5`;
};

export const compareRatings = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  const aMatch = a.match(/(\d+\.\d+)\/5/);
  const bMatch = b.match(/(\d+\.\d+)\/5/);
  
  if (aMatch && bMatch) {
    const aRating = parseFloat(aMatch[1]);
    const bRating = parseFloat(bMatch[1]);
    
    if (aRating > bRating) return 'better';
    if (aRating < bRating) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};
