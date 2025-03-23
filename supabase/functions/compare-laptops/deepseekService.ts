
/**
 * Service for interacting with DeepSeek API
 */

// Call the DeepSeek API to get comparison
export async function getComparison(
  laptopLeftData: any, 
  laptopRightData: any, 
  apiKey: string
) {
  try {
    console.log('🔄 Preparing DeepSeek comparison request...');
    
    const system_prompt = generateSystemPrompt();
    const user_prompt = generateUserPrompt(laptopLeftData, laptopRightData);
    
    console.log('📝 System prompt length:', system_prompt.length);
    console.log('📝 User prompt length:', user_prompt.length);
    
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
            content: system_prompt
          },
          {
            role: 'user',
            content: user_prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully received response from DeepSeek');
    
    return data;
  } catch (error) {
    console.error('❌ Error calling DeepSeek API:', error);
    throw error;
  }
}

// System prompt to guide the AI response
function generateSystemPrompt(): string {
  return `
You are an expert laptop comparison assistant with a witty personality. You provide detailed, accurate, and fair comparisons between two laptops, with a touch of humor.

When comparing laptops, analyze:
1. Processor performance (CPU)
2. Graphics capabilities (GPU)
3. Memory (RAM)
4. Storage capacity and speed
5. Display quality
6. Price-to-performance ratio
7. User ratings and reviews

Your output must be structured EXACTLY as valid JSON in the following format:
{
  "winner": "left" | "right" | "tie",
  "analysis": "Overall comparative analysis between the two laptops. BE SURE TO USE MULTIPLE PARAGRAPHS with line breaks between them for better readability. Include 1-2 subtle jokes or witty observations that don't compromise the technical accuracy.",
  "advantages": {
    "left": ["Advantage 1", "Advantage 2", ...],
    "right": ["Advantage 1", "Advantage 2", ...]
  },
  "recommendation": "Clear recommendation for which laptop is better for which use case",
  "valueForMoney": {
    "left": "Value assessment for left laptop",
    "right": "Value assessment for right laptop"
  }
}

IMPORTANT: 
- Your analysis MUST use multiple paragraphs with line breaks for readability
- Include 1-2 subtle humorous comments or analogies in your analysis
- Keep your technical assessment accurate and helpful despite the humor
- Return ONLY valid JSON that follows the exact structure above (no markdown, no additional text)`;
}

// Create the comparison prompt with raw Oxylabs API response data
function generateUserPrompt(laptopLeftData: any, laptopRightData: any): string {
  return `
Compare these two laptops with complete details:

LEFT LAPTOP:
${JSON.stringify(laptopLeftData.results[0].content, null, 2)}

RIGHT LAPTOP:
${JSON.stringify(laptopRightData.results[0].content, null, 2)}

Based on the raw data above, provide a comprehensive comparison. Include which laptop is better overall, which one provides better value for money, and what are the specific advantages of each. Remember to use multiple paragraphs for readability and include some witty observations that don't compromise the technical accuracy of your analysis.`;
}
