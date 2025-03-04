
import { generateSystemPrompt, generateUserPrompt } from "./promptGenerator";
import { Product } from "./types";

export async function getComparison(laptopLeft: Product, laptopRight: Product, apiKey: string): Promise<any> {
  console.log("⏱️ API call starting at:", new Date().toISOString());
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt()
        },
        {
          role: 'user',
          content: generateUserPrompt(laptopLeft, laptopRight)
        }
      ],
      temperature: 0.1  // Lower temperature for more analytical, deterministic response
    })
  });

  console.log("⏱️ API response received at:", new Date().toISOString());
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ DeepSeek API error:', response.status, errorText);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ DeepSeek response received!');
  console.log('🕒 Model used:', data.model);
  console.log('💰 Tokens used:', {
    promptTokens: data.usage?.prompt_tokens || 'unknown',
    completionTokens: data.usage?.completion_tokens || 'unknown',
    totalTokens: data.usage?.total_tokens || 'unknown'
  });
  
  return data;
}
