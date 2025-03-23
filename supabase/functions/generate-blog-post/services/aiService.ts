/**
 * Service to handle AI content generation using DeepSeek API
 */

export async function generateContentWithDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  try {
    console.log(`🔄 Preparing DeepSeek API request...`);
    console.log(`📝 System prompt length: ${systemPrompt.length} characters`);
    console.log(`📝 User prompt length: ${userPrompt.length} characters`);
    
    // Check if the user prompt contains Top10 but category isn't matching
    if (userPrompt.toLowerCase().includes('top 10') || 
        userPrompt.toLowerCase().includes('top ten') || 
        userPrompt.toLowerCase().includes('best laptops')) {
      console.log(`📢 User prompt appears to be for a Top10 post, ensuring correct handling...`);
    }
    
    // Truncate system prompt if it's too long to avoid API failures
    const maxSystemPromptLength = 96000; // Reduced from 128000 to 96000 to avoid potential issues
    let truncatedSystemPrompt = systemPrompt;
    if (systemPrompt.length > maxSystemPromptLength) {
      console.log(`⚠️ System prompt exceeds ${maxSystemPromptLength} characters, truncating...`);
      truncatedSystemPrompt = systemPrompt.substring(0, maxSystemPromptLength);
      console.log(`📝 Truncated system prompt to: ${truncatedSystemPrompt.length} characters`);
    }
    
    // For Top10 posts, ensure we don't overwhelm the API with too much product data
    if (userPrompt.toLowerCase().includes('top 10') && truncatedSystemPrompt.length > 50000) {
      console.log(`⚠️ Top10 system prompt is very large (${truncatedSystemPrompt.length} chars), simplifying...`);
      // Extract just the essential instructions from the prompt and shorten product data
      const instructionParts = truncatedSystemPrompt.split('PRODUCT DATA:');
      if (instructionParts.length > 1) {
        // Keep the instructions but limit the product data
        truncatedSystemPrompt = instructionParts[0] + 
          "PRODUCT DATA: Multiple products available with details including title, brand, price, and features. " +
          "Create a Top 10 list based on these products.";
        console.log(`📝 Simplified Top10 prompt to: ${truncatedSystemPrompt.length} characters`);
      }
    }
    
    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: truncatedSystemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000, // Set a reasonable limit to prevent timeouts
      top_p: 1,
      stream: false,
      stop: ["```json", "```JSON"]
    };
    
    // Convert payload to JSON and log size
    const jsonPayload = JSON.stringify(payload);
    console.log(`📤 DEEPSEEK REQUEST PAYLOAD SIZE: ${jsonPayload.length} bytes`);
    
    // Log a preview of the payload for debugging
    console.log(`🔍 System prompt preview: "${truncatedSystemPrompt.substring(0, 100)}..."`);
    console.log(`🔍 User prompt preview: "${userPrompt.substring(0, 100)}..."`);
    
    // Make the API request with a timeout
    console.log(`🚀 Sending request to DeepSeek API...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
    
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: jsonPayload,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`📥 DeepSeek API response status: ${response.status}`);
      
      // Check for non-200 response
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ DeepSeek API error: ${response.status} ${response.statusText}`);
        console.error(`❌ Error details: ${errorText}`);
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }
      
      // Parse the response as JSON
      const data = await response.json();
      
      // Check for empty or malformed response
      if (!data || !data.choices || !data.choices.length || !data.choices[0].message) {
        console.error(`❌ Invalid or empty response from DeepSeek API:`, data);
        // Return a fallback response instead of throwing
        return "# Top 10 Laptops\n\nUnable to generate the full content due to an API issue. Please try again later.";
      }
      
      // Log a preview of the response
      const content = data.choices[0].message.content;
      console.log(`✅ DeepSeek response received: ${content.length} characters`);
      console.log(`📄 Content preview: "${content.substring(0, 100)}..."`);
      
      // Extra validation to ensure the content is not JSON format
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        console.warn(`⚠️ Content appears to be in JSON format, will wrap in markdown code block for parsing safety`);
        return "```json\n" + content + "\n```";
      }
      
      return content;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('💥 DeepSeek API request timed out after 45 seconds');
        // Return a fallback response instead of throwing
        return "# Top 10 Laptops\n\nThe request timed out. Please try again with a shorter prompt or fewer products.";
      }
      
      console.error('💥 Fetch error:', fetchError);
      // Return a fallback response with the error message
      return `# Error Generating Content\n\nThere was an error calling the AI service: ${fetchError.message}\n\nPlease try again in a few moments.`;
    }
  } catch (error) {
    console.error(`💥 Error generating content with DeepSeek:`, error);
    // Return a fallback response instead of throwing
    return `# Error in Content Generation\n\nAn unexpected error occurred: ${error instanceof Error ? error.message : String(error)}\n\nPlease try again later.`;
  }
}
