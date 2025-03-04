
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;

// For CORS support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { laptopLeft, laptopRight } = await req.json();
    
    if (!laptopLeft || !laptopRight) {
      throw new Error('Missing laptop data for comparison');
    }
    
    console.log('Comparing laptops:', {
      leftId: laptopLeft.id,
      leftBrand: laptopLeft.brand,
      leftModel: laptopLeft.model,
      rightId: laptopRight.id,
      rightBrand: laptopRight.brand,
      rightModel: laptopRight.model
    });

    // System prompt to guide the AI response
    const systemPrompt = `
You are an expert laptop comparison assistant. You provide detailed, accurate, and fair comparisons between two laptops.

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
  "analysis": "Overall comparative analysis between the two laptops",
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

IMPORTANT: You must return ONLY valid JSON that follows the exact structure above. No markdown, no explanation outside the JSON, no additional text.`;

    // Create the comparison prompt
    const userPrompt = `
Compare these two laptops:

LEFT LAPTOP:
- Brand: ${laptopLeft.brand || 'Not specified'}
- Model: ${laptopLeft.model || 'Not specified'}
- Processor: ${laptopLeft.processor || 'Not specified'}
- RAM: ${laptopLeft.ram || 'Not specified'}
- Storage: ${laptopLeft.storage || 'Not specified'}
- Graphics: ${laptopLeft.graphics || 'Not specified'}
- Screen: ${laptopLeft.screen_size || 'Not specified'} ${laptopLeft.screen_resolution ? `(${laptopLeft.screen_resolution})` : ''}
- Price: $${laptopLeft.price?.toFixed(2) || 'Not specified'}
- Rating: ${laptopLeft.rating ? `${laptopLeft.rating}/5 (${laptopLeft.rating_count} reviews)` : 'Not specified'}

RIGHT LAPTOP:
- Brand: ${laptopRight.brand || 'Not specified'}
- Model: ${laptopRight.model || 'Not specified'}
- Processor: ${laptopRight.processor || 'Not specified'}
- RAM: ${laptopRight.ram || 'Not specified'}
- Storage: ${laptopRight.storage || 'Not specified'}
- Graphics: ${laptopRight.graphics || 'Not specified'}
- Screen: ${laptopRight.screen_size || 'Not specified'} ${laptopRight.screen_resolution ? `(${laptopRight.screen_resolution})` : ''}
- Price: $${laptopRight.price?.toFixed(2) || 'Not specified'}
- Rating: ${laptopRight.rating ? `${laptopRight.rating}/5 (${laptopRight.rating_count} reviews)` : 'Not specified'}

Based on the specifications above, provide a comprehensive comparison. Include which laptop is better overall, which one provides better value for money, and what are the specific advantages of each.`;

    // Call DeepSeek API for the comparison
    console.log('Calling DeepSeek API...');
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.2
      })
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', deepseekResponse.status, errorText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    console.log('DeepSeek response received');
    
    // Extract the content from the DeepSeek response
    const aiContent = deepseekData.choices[0]?.message?.content;
    if (!aiContent) {
      throw new Error('No content in DeepSeek response');
    }

    // Parse the response to ensure it's valid JSON
    try {
      // Clean up any potential markdown formatting
      let cleanContent = aiContent.trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
        
      const comparisonResult = JSON.parse(cleanContent);
      
      // Return the comparison result
      return new Response(
        JSON.stringify(comparisonResult),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (parseError) {
      console.error('Error parsing DeepSeek response:', parseError);
      console.error('Raw content:', aiContent);
      throw new Error('Invalid JSON response from DeepSeek');
    }

  } catch (error) {
    console.error('Error in compare-laptops function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
