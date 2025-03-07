
/**
 * Error handling utilities for generate-blog-post function
 */
import { corsHeaders } from "../../_shared/cors.ts";

export function logError(error: unknown, context: string = "Error"): void {
  console.error(`💥 ${context}:`, error);
  console.error(`⚠️ Error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  console.error(`⚠️ Error stack: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
}

export function createErrorResponse(error: unknown): Response {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error(`💥 Returning error response: ${errorMessage}`);

  return new Response(
    JSON.stringify({ error: errorMessage }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
  );
}
