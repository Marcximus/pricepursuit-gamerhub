
/**
 * Utility functions for Top10 content processing
 */
import { toast } from '@/components/ui/use-toast';

// HTML escape function to prevent XSS
export function escapeHtml(unsafe: string | number | undefined): string {
  if (unsafe === undefined || unsafe === null) return '';
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Show error toast with consistent formatting
export function showErrorToast(title: string, message: string): void {
  toast({
    title,
    description: message,
    variant: 'destructive',
  });
}

// Extract model name from a laptop title
export function extractModelName(title: string): string {
  if (!title) return '';
  
  // Common patterns for model numbers
  const patterns = [
    /\b(Legion|IdeaPad|ThinkPad|Yoga|ThinkBook)\s+([A-Za-z0-9]+(?:[-\s][A-Za-z0-9]+)*)/i,
    /\b[A-Z][0-9]{1,2}(?:[-\s][A-Za-z0-9]+)*/i,
    /\b(?:Model|Gaming)\s+([A-Za-z0-9]+(?:[-\s][A-Za-z0-9]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return '';
}

// Format price with currency symbol if necessary
export function formatPrice(price: any): string {
  if (!price) return 'Price not available';
  
  // Handle different price formats
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  } else if (typeof price === 'string') {
    return price.includes('$') ? price : `$${price}`;
  } else if (typeof price === 'object' && price.value) {
    const value = parseFloat(price.value);
    return isNaN(value) ? 'Price not available' : `$${value.toFixed(2)}`;
  }
  
  return 'Price not available';
}

// Generate stars for ratings
export function generateStars(rating: number | string | undefined): string {
  if (rating === undefined || rating === null) return '';
  
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(numericRating)) return '';
  
  const fullStars = Math.floor(numericRating);
  const halfStar = numericRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  return '⭐'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Format an Amazon product URL with affiliate tag
export function formatAmazonUrl(asin: string | undefined): string {
  if (!asin) return '#';
  return `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
}

// Generate HTML for stars display based on rating
export function generateStarsHtml(rating: number | string | undefined, totalReviews?: number): string {
  if (rating === undefined || rating === null) return '';
  
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(numericRating)) return '';
  
  const reviewCount = totalReviews ? ` (${totalReviews.toLocaleString()})` : '';
  
  return `<div class="flex items-center text-amber-500 mb-3">
    <span class="text-lg font-medium mr-1">${numericRating.toFixed(1)}</span>
    <div class="flex">
      ${'⭐'.repeat(Math.floor(numericRating))}
      ${numericRating % 1 >= 0.5 ? '⭐' : ''}
    </div>
    <span class="text-gray-500 ml-1">${reviewCount}</span>
  </div>`;
}

// Generate affiliate button HTML
export function generateAffiliateButtonHtml(asin: string | undefined, buttonText: string = 'View on Amazon'): string {
  if (!asin) return '';
  
  const url = formatAmazonUrl(asin);
  
  return `<a href="${url}" target="_blank" rel="nofollow noopener" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
    ${buttonText}
  </a>`;
}
