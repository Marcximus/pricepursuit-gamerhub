
import { getTop10Prompt } from "../prompts/top10Prompt.ts";
import { getComparisonPrompt } from "../prompts/comparisonPrompt.ts";
import { getReviewPrompt } from "../prompts/reviewPrompt.ts";
import { getHowToPrompt } from "../prompts/howToPrompt.ts";
import { getDefaultPrompt } from "../prompts/defaultPrompt.ts";

/**
 * Generate blog content using DeepSeek API
 */
export async function generateBlogContent(
  prompt: string,
  category: string,
  firstProductData: any = null,
  secondProductData: any = null,
  amazonProducts: any[] | null = null,
  apiKey: string
): Promise<any> {
  try {
    console.log(`✨ Generating ${category} blog content`);
    console.log(`📝 User prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);

    // Select the appropriate system prompt based on category
    let systemPrompt = "";
    
    switch (category) {
      case "Top10":
        systemPrompt = getTop10Prompt(amazonProducts);
        console.log(`📋 Using Top10 prompt (${systemPrompt.length} chars)`);
        break;
      case "Comparison":
        systemPrompt = getComparisonPrompt(firstProductData, secondProductData);
        console.log(`📋 Using Comparison prompt (${systemPrompt.length} chars)`);
        break;
      case "Review":
        systemPrompt = getReviewPrompt(firstProductData);
        console.log(`📋 Using Review prompt (${systemPrompt.length} chars)`);
        break;
      case "How-To":
        systemPrompt = getHowToPrompt();
        console.log(`📋 Using How-To prompt (${systemPrompt.length} chars)`);
        break;
      default:
        systemPrompt = getDefaultPrompt();
        console.log(`📋 Using Default prompt (${systemPrompt.length} chars)`);
    }

    // Call the DeepSeek API with increased timeout
    console.log(`🤖 Calling DeepSeek API with ${prompt.length} char prompt...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120-second timeout
    
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ DeepSeek API error (${response.status}): ${errorData}`);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      console.log(`✅ DeepSeek API response received (${JSON.stringify(data).length} bytes)`);
      
      // Extract the generated content
      const generatedContent = data.choices[0].message.content;
      
      // Process and format the generated content based on category
      const processedContent = processGeneratedContent(generatedContent, category, prompt);
      
      return processedContent;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Special handling for timeout errors
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ DeepSeek API request timed out after 120 seconds');
        throw new Error('The blog generation service timed out. Please try again with a simpler prompt.');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`💥 Error in generateBlogContent: ${error.message}`);
    
    // Return error content
    return {
      title: `New ${category} Post (Error)`,
      content: `
        <h1>Error Generating Content</h1>
        <p>There was an error generating this content: ${error.message}</p>
        <p>Please try again with a different prompt or contact support.</p>
      `,
      excerpt: "There was an error generating this content. Please try again.",
      category: category,
      tags: ['error']
    };
  }
}

/**
 * Process and enhance the raw generated content
 */
function processGeneratedContent(content: string, category: string, prompt: string): any {
  try {
    // Basic extraction of title from the content
    let title = "";
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/s);
    if (h1Match && h1Match[1]) {
      title = h1Match[1].replace(/<[^>]*>/g, '').trim();
    } else {
      // Try to create a title from the prompt
      const cleanPrompt = prompt.replace(/^(write|create|generate|make)\s+a\s+/i, '');
      title = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
      if (title.length > 60) {
        title = title.substring(0, 57) + '...';
      }
    }
    
    // Create a simple excerpt from the content
    let excerpt = "";
    const firstP = content.match(/<p[^>]*>(.*?)<\/p>/s);
    if (firstP && firstP[1]) {
      excerpt = firstP[1].replace(/<[^>]*>/g, '').trim();
      if (excerpt.length > 160) {
        excerpt = excerpt.substring(0, 157) + '...';
      }
    } else {
      excerpt = `A comprehensive ${category.toLowerCase()} post about ${title.toLowerCase()}.`;
    }
    
    // Generate some relevant tags
    const tags = generateTags(title, content, category);
    
    // Return the processed content
    return {
      title,
      content,
      excerpt,
      category,
      tags
    };
  } catch (error) {
    console.error(`💥 Error processing generated content: ${error.message}`);
    
    // Return minimally processed content on error
    return {
      title: prompt.substring(0, 60),
      content,
      excerpt: "Generated content based on your prompt.",
      category,
      tags: [category.toLowerCase()]
    };
  }
}

/**
 * Generate tags from content
 */
function generateTags(title: string, content: string, category: string): string[] {
  const tags = new Set<string>();
  
  // Add category as a tag
  tags.add(category.toLowerCase());
  
  // Extract potential keywords from title
  const titleWords = title.toLowerCase().split(/\s+/);
  for (const word of titleWords) {
    if (word.length > 3 && !['the', 'and', 'for', 'that', 'with'].includes(word)) {
      tags.add(word);
    }
  }
  
  // Add some common tags based on category
  if (category === 'Top10') {
    tags.add('list');
    tags.add('comparison');
  } else if (category === 'Review') {
    tags.add('review');
    tags.add('product-review');
  } else if (category === 'Comparison') {
    tags.add('comparison');
    tags.add('versus');
    tags.add('vs');
  } else if (category === 'How-To') {
    tags.add('guide');
    tags.add('tutorial');
    tags.add('how-to');
  }
  
  // Limit to 5 tags maximum
  return Array.from(tags).slice(0, 5);
}
