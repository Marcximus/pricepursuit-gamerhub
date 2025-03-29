/**
 * Service to handle AI content generation using DeepSeek API
 */

export async function generateContentWithDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  console.log(`🔍 DETAILED API REQUEST LOGGING`);
  console.log(`📏 Prompt Lengths:`);
  console.log(`   - System Prompt: ${systemPrompt.length} characters`);
  console.log(`   - User Prompt: ${userPrompt.length} characters`);
  
  console.log(`🔍 Prompt Preview:`);
  console.log(`   - System Prompt (first 200 chars): ${systemPrompt.substring(0, 200)}...`);
  console.log(`   - User Prompt (first 200 chars): ${userPrompt.substring(0, 200)}...`);

  try {
    console.log(`🔄 Preparing DeepSeek API request...`);
    console.log(`📝 System prompt length: ${systemPrompt.length} characters`);
    console.log(`📝 User prompt length: ${userPrompt.length} characters`);
    console.log(`🔑 API key validation: ${apiKey ? 'Key provided ✓' : 'Missing key ✗'}`);
    
    // Log first 200 chars of prompts for debugging
    console.log(`📝 System prompt preview: ${systemPrompt.substring(0, 200)}...`);
    console.log(`📝 User prompt preview: ${userPrompt.substring(0, 200)}...`);
    
    if (!apiKey) {
      console.error('❌ MISSING API KEY: DeepSeek API key is not set or invalid');
      throw new Error('DeepSeek API key is missing or invalid');
    }
    
    // Simplify the prompt to reduce complexity and potential formatting issues
    const simplifiedSystemPrompt = systemPrompt
      .replace(/\n\n+/g, '\n\n')  // Remove excessive newlines
      .replace(/\s{2,}/g, ' ');   // Remove excessive spaces
    
    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: simplifiedSystemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,  // Explicitly set max tokens
      top_p: 1,
      stream: false
    };
    
    // Convert payload to JSON and log size
    const jsonPayload = JSON.stringify(payload);
    console.log(`📤 DEEPSEEK REQUEST PAYLOAD SIZE: ${jsonPayload.length} bytes`);
    
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
        console.error(`❌ Raw response preview: ${rawText.substring(0, 300)}...`);
        
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
        // Create a simpler default request to test if it's the complexity of our prompt causing issues
        console.log(`🔄 Attempting simplified test request to diagnose API issues...`);
        
        const testPayload = JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Create a blog post about ${userPrompt}` }
          ],
          temperature: 0.5
        });
        
        const testResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: testPayload
        });
        
        console.log(`📊 Test response status: ${testResponse.status}`);
        const testData = await testResponse.json();
        console.log(`📊 Test response data:`, JSON.stringify(testData));
        
        // Log API usage for debugging
        if (data.usage) {
          console.log(`📊 API Usage stats:`, JSON.stringify(data.usage));
        }
        
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
