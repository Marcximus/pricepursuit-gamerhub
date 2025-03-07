
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
    
    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 1,
      stream: false,
      // Added a stop sequence to ensure we don't get any unexpected format tokens
      stop: ["```json", "```JSON"]
    };
    
    // Convert payload to JSON and log size
    const jsonPayload = JSON.stringify(payload);
    console.log(`📤 DEEPSEEK REQUEST PAYLOAD SIZE: ${jsonPayload.length} bytes`);
    
    // If the request is very large, log a more detailed preview
    if (jsonPayload.length > 10000) {
      console.log(`⚠️ Large payload, showing system prompt preview: ${systemPrompt.substring(0, 200)}...`);
      console.log(`⚠️ User prompt preview: ${userPrompt.substring(0, 200)}...`);
    }
    
    // Make the API request
    console.log(`🚀 Sending request to DeepSeek API...`);
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: jsonPayload
    });
    
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
    
    // Log a preview of the response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log(`✅ DeepSeek response received: ${content.length} characters`);
      console.log(`📄 Content preview: "${content.substring(0, 100)}..."`);
      
      // Extra validation to ensure the content is not JSON format
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        console.warn(`⚠️ Content appears to be in JSON format, will wrap in markdown code block for parsing safety`);
        return "```json\n" + content + "\n```";
      }
      
      return content;
    } else {
      console.error(`❌ Unexpected response format from DeepSeek:`, data);
      throw new Error('Unexpected response format from DeepSeek API');
    }
  } catch (error) {
    console.error(`💥 Error generating content with DeepSeek:`, error);
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
  }
}
