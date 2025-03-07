
/**
 * Service for interacting with DeepSeek API
 */
import { logError } from "../utils/errorHandler.ts";

interface MessageContent {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
}

export async function generateContentWithDeepSeek(
  systemPrompt: string, 
  userPrompt: string, 
  apiKey: string
): Promise<string> {
  console.log(`🧠 Calling DeepSeek API...`);
  console.log(`🔧 Model: deepseek-chat, Temperature: 1.4`);
  console.log(`📏 System prompt length: ${systemPrompt.length} characters`);
  console.log(`📏 User prompt length: ${userPrompt.length} characters`);
  
  // Limit the system prompt size if it's too large (DeepSeek has token limits)
  const maxSystemPromptLength = 16000; // Reasonable limit
  let processedSystemPrompt = systemPrompt;
  if (systemPrompt.length > maxSystemPromptLength) {
    console.log(`⚠️ System prompt exceeds ${maxSystemPromptLength} characters, truncating...`);
    processedSystemPrompt = systemPrompt.substring(0, maxSystemPromptLength);
  }
  
  const payload = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: processedSystemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 1.4,  // Set to 1.4 for more creative blog content
    max_tokens: 4000   // Set a token limit to prevent hitting API limits
  };
  
  console.log(`📤 DEEPSEEK REQUEST PAYLOAD SIZE: ${JSON.stringify(payload).length} bytes`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    
    const endTime = Date.now();
    console.log(`⏱️ DeepSeek API call took ${(endTime - startTime) / 1000} seconds`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API error:', errorText);
      console.error(`🔴 Status code: ${response.status}`);
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    console.log(`✅ DeepSeek API response received`);
    console.log(`📊 Tokens used: ${data.usage?.total_tokens || 'unknown'}`);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error(`❌ Invalid response format from DeepSeek:`, data);
      throw new Error('Invalid response format from DeepSeek');
    }
    
    const generatedContent = data.choices[0].message.content;
    const contentPreview = generatedContent.substring(0, 100).replace(/\n/g, ' ');
    console.log(`📄 Generated content preview: "${contentPreview}..."`);
    
    return generatedContent;
  } catch (error) {
    console.error(`💥 DeepSeek API call failed:`, error);
    // Add more context to the error for better debugging
    throw new Error(`DeepSeek API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
