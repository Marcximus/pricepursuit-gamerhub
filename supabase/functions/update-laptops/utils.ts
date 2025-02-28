
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function parseRating(ratingText: string | null): number | null {
  if (!ratingText) return null;
  const match = ratingText.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

export function parseReviewCount(reviewText: string | null): number | null {
  if (!reviewText) return null;
  const match = reviewText.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export function parsePrice(priceText: string | null): number | null {
  if (!priceText) return null;
  const cleanPrice = priceText.replace(/[^0-9.]/g, '');
  const price = parseFloat(cleanPrice);
  return isNaN(price) ? null : price;
}
