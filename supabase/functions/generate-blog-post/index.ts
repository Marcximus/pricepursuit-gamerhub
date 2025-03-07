
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }

    // Extract the request data
    const { prompt, category } = await req.json();

    if (!prompt || !category) {
      return new Response(
        JSON.stringify({ error: "Prompt and category are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating ${category} blog post with prompt: ${prompt}`);

    // Create system prompt based on category
    const systemPrompt = getSystemPrompt(category);
    
    // Generate content using DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Parse the generated content
    const parsedContent = parseGeneratedContent(generatedContent, category);
    
    console.log('Successfully generated blog content');
    
    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating blog post:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function getSystemPrompt(category: string): string {
  const basePrompt = `You are an expert tech writer specializing in laptops. Create high-quality, detailed, and informative content for a blog about laptops.

Your writing should:
- Be engaging and accessible to tech enthusiasts
- Include relevant technical details and specifications
- Use proper HTML formatting (<h2>, <p>, <ul>, etc.) for structure
- Be factually accurate and up-to-date
- Include a catchy title
- Have a brief excerpt/summary (2-3 sentences)
- Suggest 3-5 relevant tags

Format your response as a JSON object with these fields:
{
  "title": "Your generated title",
  "content": "The full HTML-formatted blog post content",
  "excerpt": "A brief 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  switch (category) {
    case 'Top10':
      return `${basePrompt}

For a Top 10 list:
- Create a compelling introduction explaining the criteria used for selection
- Number each item clearly (1-10)
- For each item, include:
  * A descriptive heading with the laptop name/model
  * Key specifications and features
  * Pros and cons
  * A brief explanation of why it's ranked in this position
- Conclude with a summary and additional buying advice`;

    case 'Review':
      return `${basePrompt}

For a Laptop Review:
- Start with an engaging introduction about the laptop model
- Include sections on:
  * Design and build quality
  * Display
  * Performance and hardware
  * Keyboard and trackpad
  * Battery life
  * Ports and connectivity
  * Software experience
  * Value for money
- Provide a balanced assessment of strengths and weaknesses
- End with a clear conclusion and recommendation`;

    case 'Comparison':
      return `${basePrompt}

For a Laptop Comparison:
- Begin with an introduction explaining why these models are being compared
- Create clear head-to-head sections comparing:
  * Design and build
  * Display quality
  * Performance benchmarks
  * Battery life
  * Features and extras
  * Price and value
- Use tables when appropriate for direct spec comparisons
- Highlight the key differences between the models
- Conclude with specific recommendations for different user types`;

    case 'How-To':
      return `${basePrompt}

For a How-To Guide:
- Start with a clear introduction explaining the goal of the guide
- Break down the process into clear, numbered steps
- Include warnings or notes where things might go wrong
- Add prerequisites or required tools/software
- Use a conversational, instructional tone
- Include troubleshooting tips for common issues
- End with a summary and next steps`;

    default:
      return basePrompt;
  }
}

function parseGeneratedContent(content: string, category: string) {
  try {
    // Attempt to parse if it's already valid JSON
    try {
      const parsedJson = JSON.parse(content);
      return {
        ...parsedJson,
        category,
      };
    } catch (e) {
      // If not valid JSON, try to extract JSON from the text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedJson = JSON.parse(jsonStr);
        return {
          ...parsedJson,
          category,
        };
      }

      // If we still can't parse it, try a more manual approach
      const title = content.match(/title["']?\s*:\s*["']([^"']+)["']/i)?.[1] || "";
      const excerpt = content.match(/excerpt["']?\s*:\s*["']([^"']+)["']/i)?.[1] || "";
      
      // Extract content - this is tricky as it might contain newlines and quotes
      let extractedContent = "";
      const contentMatch = content.match(/content["']?\s*:\s*["']([^]+?)["'],/i);
      if (contentMatch && contentMatch[1]) {
        extractedContent = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      
      // Extract tags
      const tagsMatch = content.match(/tags["']?\s*:\s*\[(.*?)\]/i);
      const tags = tagsMatch ? 
        tagsMatch[1].split(',').map(tag => 
          tag.trim().replace(/^["']|["']$/g, '')
        ) : [];
      
      return {
        title,
        content: extractedContent || content,  // Fallback to the entire content if extraction failed
        excerpt,
        category,
        tags,
      };
    }
  } catch (error) {
    console.error('Error parsing generated content:', error);
    // Return the raw content if parsing fails
    return {
      title: "Generated Blog Post",
      content: content,
      excerpt: "Generated blog content",
      category,
      tags: [],
    };
  }
}
