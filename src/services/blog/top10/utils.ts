
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
