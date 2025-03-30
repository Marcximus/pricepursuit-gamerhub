
/**
 * Error handling utilities for blog post generation
 */
import { toast } from '@/components/ui/use-toast';

/**
 * Display an error toast and log the error
 */
export function handleGenerationError(error: unknown, context?: string): void {
  console.error(`💥 Error ${context ? 'in ' + context : ''}:`, error);
  console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
  
  toast({
    title: 'Error',
    description: error instanceof Error ? error.message : 'Failed to generate blog post',
    variant: 'destructive',
  });
}
