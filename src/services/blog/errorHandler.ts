
import { toast } from '@/components/ui/use-toast';
import { GeneratedBlogContent } from './types';

/**
 * Creates a fallback blog content object with error information
 */
export function createErrorBlogContent(
  category: string, 
  errorMessage: string
): GeneratedBlogContent {
  return {
    title: `New ${category} Post (Error)`,
    content: `
      <h1>Error Generating Content</h1>
      <p>There was an error calling the blog generation service: ${errorMessage}</p>
      <p>Please try again in a few moments.</p>
    `,
    excerpt: "There was an error generating this content. Please try again.",
    category: category as any,
    tags: ['error']
  };
}

/**
 * Displays error toast and logs error details
 */
export function handleBlogError(error: unknown, errorType: string): void {
  console.error(`💥 Error in ${errorType}:`, error);
  
  toast({
    title: 'Error',
    description: error instanceof Error ? error.message : 'Failed to generate blog post',
    variant: 'destructive',
  });
}

/**
 * Displays warning toast for potential issues
 */
export function showWarningToast(title: string, message: string): void {
  toast({
    title,
    description: message,
    variant: 'default',
  });
}
