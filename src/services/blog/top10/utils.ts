
/**
 * Utility functions for Top10 blog posts
 */

/**
 * Format a price value into a consistent format
 * @param price The price value which could be a string, number, object with value/current properties
 * @returns Formatted price string (e.g., "$399" or "Price not available")
 */
export function formatPrice(price: string | number | { value?: string | number; current?: string | number } | null | undefined): string {
  // Handle null, undefined or empty values
  if (price === null || price === undefined || price === '') {
    return 'Price not available';
  }
  
  // Handle object with value property
  if (typeof price === 'object') {
    if (price.value !== undefined) {
      return formatPrice(price.value);
    }
    if (price.current !== undefined) {
      return formatPrice(price.current);
    }
    return 'Price not available';
  }
  
  // Convert numeric value to string
  if (typeof price === 'number') {
    // Format with comma for thousands
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  
  // Handle string values
  if (typeof price === 'string') {
    // If already formatted with $, return as is
    if (price.startsWith('$')) {
      return price;
    }
    
    // Try to parse as number
    const numValue = parseFloat(price.replace(/[^\d.]/g, ''));
    if (!isNaN(numValue)) {
      return `$${numValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    
    // Return string value with $ prepended
    return `$${price}`;
  }
  
  // Fallback for any other unexpected input
  return 'Price not available';
}

/**
 * Generate a properly formatted Amazon affiliate URL
 * @param asin Product ASIN
 * @returns Formatted Amazon URL
 */
export function formatAmazonUrl(asin: string): string {
  // If no ASIN provided, return generic Amazon URL
  if (!asin) {
    return 'https://www.amazon.com/s?k=lenovo+laptop&tag=with-laptop-discount-20';
  }
  
  // Return properly formatted Amazon URL with affiliate tag
  return `https://www.amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
}

/**
 * Generate HTML for star ratings
 * @param rating The numerical rating value
 * @param totalRatings The total number of ratings
 * @returns HTML string for star rating display
 */
export function generateStarsHtml(rating?: number | string, totalRatings?: number): string {
  // Parse rating if it's a string
  let ratingValue = 0;
  if (typeof rating === 'string') {
    ratingValue = parseFloat(rating);
  } else if (typeof rating === 'number') {
    ratingValue = rating;
  }
  
  // If rating is invalid, return "No ratings"
  if (isNaN(ratingValue) || ratingValue <= 0) {
    return '<div class="text-gray-500">No ratings</div>';
  }
  
  // Cap rating at 5 stars
  ratingValue = Math.min(ratingValue, 5);
  
  // Generate filled stars based on rating
  const fullStars = Math.floor(ratingValue);
  const halfStar = ratingValue % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  // Create star HTML elements
  let starsHtml = '<div class="flex items-center">';
  
  // Filled stars
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<span class="text-yellow-400">★</span>';
  }
  
  // Half star if applicable
  if (halfStar) {
    starsHtml += '<span class="text-yellow-400">⯪</span>'; // Unicode half-star
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<span class="text-gray-300">☆</span>';
  }
  
  // Add rating number and total if available
  starsHtml += `<span class="ml-1 text-sm text-gray-600">${ratingValue.toFixed(1)}`;
  
  if (totalRatings) {
    // Format total ratings with comma separators
    const formattedTotal = totalRatings.toLocaleString();
    starsHtml += ` (${formattedTotal} reviews)`;
  }
  
  starsHtml += '</span></div>';
  
  return starsHtml;
}
