
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
  
  const payload = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 1.4,  // Set to 1.4 for more creative blog content
  };
  
  console.log(`📤 DEEPSEEK REQUEST: ${JSON.stringify(payload).substring(0, 500)}...`);
  
  const startTime = Date.now();
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
    const errorData = await response.text();
    console.error('❌ DeepSeek API error:', errorData);
    console.error(`🔴 Status code: ${response.status}`);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data: DeepSeekResponse = await response.json();
  console.log(`✅ DeepSeek API response received`);
  console.log(`📊 Tokens used: ${data.usage?.total_tokens || 'unknown'}`);
  
  const generatedContent = data.choices[0].message.content;
  const contentPreview = generatedContent.substring(0, 100).replace(/\n/g, ' ');
  console.log(`📄 Generated content preview: "${contentPreview}..."`);
  
  return generatedContent;
}
