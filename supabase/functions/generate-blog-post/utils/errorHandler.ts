
/**
 * Error handling utilities for generate-blog-post function
 */
import { corsHeaders } from "../../_shared/cors.ts";

export function logError(error: unknown, context: string = "Error"): void {
  console.error(`💥 ${context}:`, error);
  
  // Safely extract error details
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
  const errorName = error instanceof Error ? error.name : 'Unknown error type';
  
  console.error(`⚠️ Error type: ${errorName}`);
  console.error(`⚠️ Error message: ${errorMessage}`);
  console.error(`⚠️ Error stack: ${errorStack}`);
  
  try {
    // Try to extract more information from the error object
    console.error(`⚠️ FULL ERROR OBJECT: ${JSON.stringify(error, 
      (key, value) => {
        if (key === 'stack') return undefined; // Skip stack to avoid duplication
        return value;
      }, 2)}`);
  } catch (jsonError) {
    console.error(`⚠️ Could not stringify error object: ${jsonError.message}`);
    
    // Try to log error properties individually
    if (error && typeof error === 'object') {
      console.error('⚠️ Error properties:');
      for (const key of Object.getOwnPropertyNames(error)) {
        try {
          console.error(`  - ${key}: ${JSON.stringify((error as any)[key])}`);
        } catch (e) {
          console.error(`  - ${key}: [Cannot stringify]`);
        }
      }
    }
  }
  
  // Log request information if this is a fetch error
  if (error && (error as any).request) {
    try {
      const request = (error as any).request;
      console.error('⚠️ Request details:', {
        url: request.url,
        method: request.method,
        headers: request.headers
      });
    } catch (reqError) {
      console.error('⚠️ Could not log request details:', reqError);
    }
  }
  
  // Log memory usage in case this is a memory-related issue
  try {
    const memoryUsage = Deno.memoryUsage();
    console.error('⚠️ Memory usage at error:', {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    });
  } catch (memError) {
    console.error('⚠️ Could not log memory usage:', memError);
  }
}

export function createErrorResponse(error: unknown): Response {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  console.error(`💥 Returning error response: ${errorMessage}`);

  // Create a detailed error object for debugging
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

  console.error(`💥 FULL ERROR RESPONSE: ${JSON.stringify(errorDetails, null, 2)}`);

  return new Response(
    JSON.stringify(errorDetails),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    }
  );
}
