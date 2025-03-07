
/**
 * Utility functions for Top10 content processing
 */
import { toast } from '@/components/ui/use-toast';

// Simple HTML escape function to prevent XSS in product data
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

// Toast notification helper for process errors
export function showErrorToast(title: string, description: string) {
  toast({
    title,
    description,
    variant: 'destructive',
  });
}
