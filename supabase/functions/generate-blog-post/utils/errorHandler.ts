
import { corsHeaders } from "../../_shared/cors.ts";

export function logError(error: any, context: string) {
  console.error(`❌ ERROR in ${context}:`, error);
  if (error instanceof Error) {
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  } else {
    console.error("Non-error object:", JSON.stringify(error));
  }
}

export function createErrorResponse(error: any) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  const details = error instanceof Error ? error.stack : JSON.stringify(error);
  
  // Always include CORS headers in error responses
  return new Response(
    JSON.stringify({
      error: message,
      details: details,
      timestamp: new Date().toISOString()
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    }
  );
}
