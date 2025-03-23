
/**
 * Error handling utilities
 */
import { corsHeaders } from "../../_shared/cors.ts";

/**
 * Log errors consistently
 */
export function logError(error: unknown, context = "Error") {
  if (error instanceof Error) {
    console.error(`💥 ${context}: ${error.message}`);
    if (error.stack) {
      console.error(`📚 Stack trace: ${error.stack}`);
    }
  } else {
    console.error(`💥 ${context}: ${String(error)}`);
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown, status = 500) {
  const message = error instanceof Error 
    ? error.message 
    : "An unexpected error occurred";
  
  const errorBody = {
    error: message,
    status: status,
    timestamp: new Date().toISOString()
  };
  
  console.error(`🔴 Returning error response: ${JSON.stringify(errorBody)}`);
  
  return new Response(
    JSON.stringify(errorBody),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  );
}
