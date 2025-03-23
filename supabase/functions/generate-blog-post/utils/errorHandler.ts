
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
  console.error(`⚠️ FULL ERROR OBJECT: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
}

export function createErrorResponse(error: unknown): Response {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error(`💥 Returning error response: ${errorMessage}`);

  // Create a detailed error object for debugging - no fallback content
  const errorDetails = {
    error: errorMessage,
    timestamp: new Date().toISOString(),
    success: false,
    details: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : {
      raw: String(error)
    }
  };

  console.error(`💥 FULL ERROR RESPONSE: ${JSON.stringify(errorDetails)}`);

  return new Response(
    JSON.stringify(errorDetails),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    }
  );
}
