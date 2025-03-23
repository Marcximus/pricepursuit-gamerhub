
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
    
    if (!apiKey) {
      console.error('❌ MISSING API KEY: DeepSeek API key is not set or invalid');
      throw new Error('DeepSeek API key is missing or invalid');
    }
    
    // Log prompt previews to help debug data passing
    const systemPromptPreview = systemPrompt.substring(0, 500);
    const userPromptPreview = userPrompt.substring(0, 500);
    console.log(`📝 System prompt preview: ${systemPromptPreview}...`);
    console.log(`📝 User prompt preview: ${userPromptPreview}...`);
    
    // Check if prompts contain product data
    const hasProductData = systemPrompt.includes('product') || userPrompt.includes('product');
    console.log(`🔍 Prompts contain product data: ${hasProductData ? 'Yes ✓' : 'No ✗'}`);
    
    // Log if prompt contains product specifications
    const hasProductSpecs = systemPrompt.includes('specifications') || userPrompt.includes('specifications');
    console.log(`🔍 Prompts contain product specifications: ${hasProductSpecs ? 'Yes ✓' : 'No ✗'}`);
    
    // Check for large data volume
    const totalPromptSize = systemPrompt.length + userPrompt.length;
    console.log(`📊 Total prompt size: ${totalPromptSize} characters`);
    if (totalPromptSize > 100000) {
      console.warn(`⚠️ Very large prompt size (${totalPromptSize} chars). This might affect DeepSeek's processing.`);
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
    
    // If the request is very large, log a more detailed preview
    if (jsonPayload.length > 10000) {
      console.log(`⚠️ Large payload, showing system prompt preview: ${systemPrompt.substring(0, 200)}...`);
      console.log(`⚠️ User prompt preview: ${userPrompt.substring(0, 200)}...`);
    }
    
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
        console.error(`❌ Error details: ${errorText}`);
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
      console.log(`📥 Raw response from DeepSeek (first 500 chars): ${rawText.substring(0, 500)}...`);
      console.log(`📥 Raw response from DeepSeek (last 500 chars): ...${rawText.substring(rawText.length - 500)}`);
      
      try {
        data = JSON.parse(rawText);
        console.log(`✅ DeepSeek API JSON parsed successfully`);
      } catch (jsonError) {
        console.error(`❌ Error parsing API response as JSON: ${jsonError}`);
        console.error(`❌ Raw response preview: ${rawText.substring(0, 1000)}...`);
        
        // If JSON parsing fails but we have content, return it directly
        // This handles cases where the API returns valid content but not in JSON format
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
    
    // Log a preview of the response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log(`✅ DeepSeek response content received: ${content ? content.length : 0} characters`);
      
      if (!content || content.length === 0) {
        console.error(`❌ DeepSeek returned EMPTY content! Response structure:`, JSON.stringify(data));
        throw new Error('DeepSeek API returned empty content');
      }
      
      console.log(`📄 Content preview (first 100 chars): "${content.substring(0, 100)}..."`);
      console.log(`📄 Content preview (last 100 chars): "...${content.substring(content.length - 100)}"`);
      
      // Emergency content validation - check if it's actually HTML content for blog posts
      if (content.length > 100 && !content.includes('<h1>') && !content.includes('<p>') && 
          !content.includes('<h2>') && !content.includes('<div>')) {
        console.warn(`⚠️ Content doesn't appear to contain HTML tags. Adding emergency HTML wrapping...`);
        return `<h1>Blog Post</h1><div>${content}</div>`;
      }
      
      // Extra validation to ensure the content is not JSON format
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        console.warn(`⚠️ Content appears to be in JSON format, will wrap in markdown code block for parsing safety`);
        return "```json\n" + content + "\n```";
      }
      
      return content;
    } else {
      console.error(`❌ Unexpected response format from DeepSeek:`, JSON.stringify(data));
      
      // Emergency fallback: if we have any data at all, try to extract content
      if (data && typeof data === 'object') {
        const possibleContentLocations = [
          data.choices?.[0]?.message?.content,
          data.choices?.[0]?.text,
          data.content,
          data.text,
          data.result,
          data.output
        ];
        
        for (const possibleContent of possibleContentLocations) {
          if (possibleContent && typeof possibleContent === 'string' && possibleContent.length > 0) {
            console.log(`🆘 Found potential content in unexpected location: ${possibleContent.substring(0, 100)}...`);
            return possibleContent;
          }
        }
      }
      
      throw new Error('Unexpected response format from DeepSeek API - missing content in response');
    }
  } catch (error) {
    console.error(`💥 Error generating content with DeepSeek:`, error);
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
  }
}
