
/**
 * Service for handling DeepSeek API interactions
 */
import { corsHeaders } from "../cors.ts";

interface DeepSeekRequest {
  prompt: string;
  systemPrompt: string;
}

/**
 * Calls the DeepSeek API to get laptop recommendations
 */
export async function getLaptopRecommendations(request: DeepSeekRequest): Promise<any> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!apiKey) {
    console.error("❌ DEEPSEEK_API_KEY environment variable is not set");
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }
  
  console.log("📝 System prompt:", request.systemPrompt);
  console.log("📝 User prompt:", request.prompt);
  console.log("🔑 Calling DeepSeek API with key:", apiKey.substring(0, 5) + "..." + "(masked for security)");
  
  // Create DeepSeek request payload
  const deepseekRequest = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };
  console.log("📤 DeepSeek request payload:", JSON.stringify(deepseekRequest));
  
  // Call DeepSeek API
  const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deepseekRequest)
  });

  console.log("📥 DeepSeek API response status:", deepseekResponse.status);
  console.log("📥 DeepSeek API response headers:", Object.fromEntries(deepseekResponse.headers.entries()));

  if (!deepseekResponse.ok) {
    const errorText = await deepseekResponse.text();
    console.error("❌ DeepSeek API error:", deepseekResponse.status, errorText);
    throw new Error(`DeepSeek API error: ${deepseekResponse.status}. Response: ${errorText}`);
  }

  const responseText = await deepseekResponse.text();
  console.log("📥 Raw DeepSeek response:", responseText);
  
  try {
    const deepseekData = JSON.parse(responseText);
    console.log("✅ Parsed DeepSeek response:", JSON.stringify(deepseekData));
    return deepseekData;
  } catch (parseError) {
    console.error("❌ Error parsing DeepSeek response JSON:", parseError);
    throw new Error("Invalid JSON response from DeepSeek");
  }
}

/**
 * Extracts recommendations from DeepSeek API response
 */
export function extractRecommendations(deepseekData: any): any[] {
  if (!deepseekData.choices || !deepseekData.choices[0]?.message?.content) {
    console.error("❌ Invalid response structure from DeepSeek");
    throw new Error("Invalid response structure from DeepSeek");
  }

  try {
    // Extract JSON from the response
    const jsonContent = deepseekData.choices[0].message.content;
    console.log("📄 DeepSeek content:", jsonContent);
    
    // Find JSON object between curly braces
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : jsonContent;
    console.log("📄 Extracted JSON string:", jsonString);
    
    // Parse the JSON
    const parsedData = JSON.parse(jsonString);
    console.log("✅ Parsed recommendation data:", JSON.stringify(parsedData));
    
    if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
      console.error("❌ Invalid recommendations format from DeepSeek");
      throw new Error("Invalid recommendations format from DeepSeek");
    }
    
    // Process recommendations to ensure they have all required fields
    const processedRecommendations = parsedData.recommendations.map((rec: any) => {
      // Ensure each recommendation has a highlights array with exactly 3 items
      if (!rec.highlights || !Array.isArray(rec.highlights) || rec.highlights.length < 3) {
        // Create default highlights if missing or insufficient
        rec.highlights = rec.highlights || [];
        
        // Add generic highlights if fewer than 3
        const defaultHighlights = [
          `Great for ${rec.usage || 'daily use'}`,
          `Excellent performance`,
          `Good value for money`
        ];
        
        while (rec.highlights.length < 3) {
          rec.highlights.push(defaultHighlights[rec.highlights.length]);
        }
      }
      
      // Limit to exactly 3 highlights
      rec.highlights = rec.highlights.slice(0, 3);
      
      return rec;
    });
    
    return processedRecommendations;
  } catch (error) {
    console.error("❌ Error parsing DeepSeek response:", error);
    throw new Error("Failed to parse laptop recommendations: " + error.message);
  }
}
