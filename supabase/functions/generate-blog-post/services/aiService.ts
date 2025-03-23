
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
    console.log(`🔑 API key validation: ${apiKey ? 'Key provided ✓' : 'Missing key ✗'}`);
    
    // Log full system prompt for debugging
    console.log(`📝 FULL SYSTEM PROMPT: ${systemPrompt}`);
    console.log(`📝 FULL USER PROMPT: ${userPrompt}`);
    
    if (!apiKey) {
      console.error('❌ MISSING API KEY: DeepSeek API key is not set or invalid');
      throw new Error('DeepSeek API key is missing or invalid');
    }
    
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
      top_p: 1,
      stream: false,
      stop: ["```json", "```JSON"]
    };
    
    // Convert payload to JSON and log size
    const jsonPayload = JSON.stringify(payload);
    console.log(`📤 DEEPSEEK REQUEST PAYLOAD SIZE: ${jsonPayload.length} bytes`);
    console.log(`📤 FULL DEEPSEEK REQUEST PAYLOAD: ${jsonPayload}`);
    
    // Make the API request
    console.log(`🚀 Sending request to DeepSeek API...`);
    const startTime = Date.now();
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: jsonPayload
    });
    
    const requestDuration = Date.now() - startTime;
    console.log(`📥 DeepSeek API response received in ${requestDuration}ms with status: ${response.status}`);
    console.log(`📥 DeepSeek API response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    // Check for non-200 response
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorText = await response.text();
        errorDetails = errorText;
        console.error(`❌ DeepSeek API error: ${response.status} ${response.statusText}`);
        console.error(`❌ FULL ERROR RESPONSE: ${errorText}`);
      } catch (readError) {
        errorDetails = 'Could not read error response';
        console.error(`❌ Failed to read error response: ${readError}`);
      }
      
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
    }
    
    // Parse the response as JSON
    let data;
    try {
      const rawText = await response.text();
      console.log(`📥 FULL RAW RESPONSE FROM DEEPSEEK: ${rawText}`);
      
      try {
        data = JSON.parse(rawText);
        console.log(`✅ DeepSeek API JSON parsed successfully`);
        console.log(`📥 FULL PARSED DEEPSEEK RESPONSE: ${JSON.stringify(data)}`);
      } catch (jsonError) {
        console.error(`❌ Error parsing API response as JSON: ${jsonError}`);
        console.error(`❌ Raw response preview: ${rawText}`);
        
        // If JSON parsing fails but we have content, return it directly
        if (rawText && rawText.length > 0 && (rawText.includes('<h1>') || rawText.includes('<p>'))) {
          console.log(`🔄 Returning raw text content as HTML seems to be present`);
          return rawText;
        }
        
        throw new Error(`Failed to parse DeepSeek API response: ${jsonError.message}`);
      }
    } catch (textError) {
      console.error(`❌ Error getting response text: ${textError}`);
      throw new Error(`Failed to read DeepSeek API response: ${textError.message}`);
    }
    
    // Extract and return content
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log(`✅ DeepSeek response content received: ${content ? content.length : 0} characters`);
      
      if (!content || content.length === 0) {
        console.error(`❌ DeepSeek returned EMPTY content! Response structure:`, JSON.stringify(data));
        throw new Error('DeepSeek API returned empty content');
      }
      
      console.log(`📄 FULL DEEPSEEK CONTENT: ${content}`);
      
      // Extra validation to ensure the content is not JSON format
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        console.warn(`⚠️ Content appears to be in JSON format, will wrap in markdown code block for parsing safety`);
        return "```json\n" + content + "\n```";
      }
      
      return content;
    } else {
      console.error(`❌ Unexpected response format from DeepSeek:`, JSON.stringify(data));
      throw new Error('Unexpected response format from DeepSeek API - missing content in response');
    }
  } catch (error) {
    console.error(`💥 Error generating content with DeepSeek:`, error);
    console.error(`💥 Error stack:`, error instanceof Error ? error.stack : 'No stack available');
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
  }
}
