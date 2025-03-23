
/**
 * Utility functions for Top10 blog post processing
 */
import { toast } from '@/components/ui/use-toast';

/**
 * Format a product price with a dollar sign and proper formatting
 */
export function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null || price === '') {
    return '$';
  }
  
  // Handle string prices
  if (typeof price === 'string') {
    // If string already has a dollar sign, return it
    if (price.includes('$')) {
      return price;
    }
    // Try to convert to a number
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) {
      return '$';
    }
    return `$${numPrice.toFixed(2)}`;
  }
  
  // Handle numeric prices
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  
  // Handle objects that might have a value property
  if (typeof price === 'object' && price !== null) {
    if ('value' in price && typeof price.value !== 'undefined') {
      return formatPrice(price.value);
    }
    if ('current' in price && typeof price.current !== 'undefined') {
      return formatPrice(price.current);
    }
  }
  
  return '$';
}

/**
 * Format an Amazon product URL with affiliate tag
 */
export function formatAmazonUrl(asin: string): string {
  if (!asin) {
    return 'https://amazon.com?tag=with-laptop-discount-20';
  }
  return `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
}

/**
 * Show an error toast message
 */
export function showErrorToast(title: string, message: string): void {
  toast({
    title,
    description: message,
    variant: 'destructive',
  });
}

/**
 * Generate star rating HTML string
 */
export function generateStars(rating: number | string | undefined): string {
  if (!rating) {
    return '★★★★★';
  }
  
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  if (isNaN(numRating)) {
    return '★★★★★';
  }
  
  const fullStars = Math.floor(numRating);
  const halfStar = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

/**
 * Generate HTML for star ratings with review count
 */
export function generateStarsHtml(rating: number | string | undefined, reviewCount: number | string | undefined): string {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : (typeof rating === 'number' ? rating : 0);
  const numReviews = typeof reviewCount === 'string' ? parseInt(reviewCount, 10) : (typeof reviewCount === 'number' ? reviewCount : 0);
  
  if (isNaN(numRating) || numRating === 0) {
    return '<div class="flex items-center mb-2"><span class="text-gray-600">No ratings</span></div>';
  }
  
  // Generate the filled and empty stars
  const totalStars = 5;
  const filledStars = Math.floor(numRating);
  const hasHalfStar = numRating % 1 >= 0.5;
  const emptyStars = totalStars - filledStars - (hasHalfStar ? 1 : 0);
  
  // Create the HTML
  let starsHtml = '<div class="flex items-center mb-2">';
  starsHtml += '<div class="flex mr-1">';
  
  // Add filled stars
  for (let i = 0; i < filledStars; i++) {
    starsHtml += '<svg class="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>';
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    starsHtml += '<svg class="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="url(#half-star)"></path><defs><linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0"><stop offset="50%" stop-color="currentColor"></stop><stop offset="50%" stop-color="transparent" stop-opacity="1"></stop></linearGradient></defs></svg>';
  }
  
  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>';
  }
  
  starsHtml += '</div>';
  
  // Add the rating text
  starsHtml += `<span class="text-gray-600 text-sm">${numRating.toFixed(1)} out of 5`;
  
  // Add review count if available
  if (numReviews > 0) {
    starsHtml += ` (${numReviews.toLocaleString()} reviews)`;
  }
  
  starsHtml += '</span></div>';
  
  return starsHtml;
}

/**
 * Generate HTML for the Amazon affiliate button
 */
export function generateAffiliateButtonHtml(asin: string): string {
  return `
    <a href="${formatAmazonUrl(asin)}" 
       class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors" 
       target="_blank" rel="nofollow noopener">
      Check Price on Amazon
    </a>
  `;
}
