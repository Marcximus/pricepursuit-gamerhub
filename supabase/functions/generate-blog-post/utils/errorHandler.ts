
/**
 * Error handling utilities for generate-blog-post function
 */
import { corsHeaders } from "../../_shared/cors.ts";

export function logError(error: unknown, context: string = "Error"): void {
  console.error(`💥 ${context}:`, error);
  
  // Safely extract error details
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
  
  console.error(`⚠️ Error message: ${errorMessage}`);
  console.error(`⚠️ Error stack: ${errorStack}`);
}

export function createErrorResponse(error: unknown): Response {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error(`💥 Returning error response: ${errorMessage}`);

  // Create a more detailed error object for debugging
  const errorDetails = {
    error: errorMessage,
    timestamp: new Date().toISOString(),
    details: error instanceof Error ? {
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // Include just the top of the stack
    } : undefined
  };

  return new Response(
    JSON.stringify(errorDetails),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    }
  );
}
