
/**
 * Creates a system prompt for the DeepSeek AI based on the blog post category
 */
export function getSystemPrompt(category: string, productData?: any): string {
  const basePrompt = `You are an expert tech writer specializing in laptops. Create high-quality, detailed, and informative content for a blog about laptops.

Your writing should:
- Be engaging and accessible to tech enthusiasts
- Include relevant technical details and specifications
- Use proper HTML formatting (<h2>, <p>, <ul>, etc.) for structure
- Be factually accurate and up-to-date
- Include a catchy title
- Have a brief excerpt/summary (2-3 sentences)
- Suggest 3-5 relevant tags`;

  switch (category) {
    case 'Top10':
      return `${basePrompt}

For a Top 10 list:
- Create a compelling introduction explaining the criteria used for selection (at least 3 paragraphs)
- Create an HTML table with headers in the intro section showing the top 10 laptops with columns for Rank, Model, Key Specs, and Rating
- Number each item clearly (1-10) using <h2> tags with the laptop name/model
- For each item, include:
  * A descriptive heading with the laptop name/model
  * Use placeholder text [PRODUCT_DATA_1], [PRODUCT_DATA_2], etc. up to [PRODUCT_DATA_10] where detailed product information will be inserted
  * Each placeholder should be surrounded by <div class="product-data" data-product-id="X"></div> where X is the number 1-10
  * Write at least 3 paragraphs of analysis for each laptop explaining its strengths, weaknesses, and ideal use cases
- Conclude with a summary and additional buying advice
- After the main content, add space for video with: <div class="video-placeholder"></div>

Format your response as a JSON object with these fields:
{
  "title": "Your generated title",
  "content": "The full HTML-formatted blog post content with placeholders for product data",
  "excerpt": "A brief 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    case 'Review':
      // If product data is provided, use it to enhance the prompt
      if (productData) {
        return `${basePrompt}

For a Product Review of ${productData.title}:
- Write in a slightly humorous, engaging tone while remaining informative and helpful
- Begin with an engaging introduction about the laptop featuring a link to Amazon using this format:
  <div class="product-highlight">
    <div class="product-image"><img src="${productData.images?.[0] || ''}" alt="${productData.title}" /></div>
    <div class="product-info">
      <h3><a href="${productData.url}" target="_blank">${productData.title}</a></h3>
      <div class="product-rating">Rating: ${productData.rating?.rating || 'N/A'} (${productData.rating?.rating_count || 0} reviews)</div>
      <div class="product-price">Price: $${productData.price?.current || 'Check price'}</div>
    </div>
  </div>

- Include these sections:
  * Design and build quality
  * Display quality (${productData.specifications?.screen_size || 'screen size'}, ${productData.specifications?.screen_resolution || 'resolution'})
  * Performance (${productData.specifications?.processor || 'processor'}, ${productData.specifications?.ram || 'RAM'}, ${productData.specifications?.storage || 'storage'})
  * Graphics capability (${productData.specifications?.graphics || 'graphics card'})
  * Keyboard and trackpad
  * Battery life (${productData.specifications?.battery_life || 'battery info'})
  * Ports and connectivity
  * Software experience
  * Value for money

- Create a "Pros and Cons" section with at least 3 items each in bulleted lists
- Create a rating system (out of 10) for:
  * Performance: [Score]
  * Display: [Score]
  * Build Quality: [Score]
  * Battery Life: [Score]
  * Value: [Score]
  * Overall: [Score]
- Provide a balanced assessment of strengths and weaknesses
- End with a clear conclusion and recommendation
- After the main content, add space for video with: <div class="video-placeholder"></div>

Format your response as a JSON object with these fields:
{
  "title": "Review: ${productData.title}",
  "content": "The full HTML-formatted blog post content",
  "excerpt": "A brief 2-3 sentence summary of your review findings",
  "tags": ["${productData.brand || 'Laptop'}", "Review", "Tech Review", "${productData.specifications?.processor || 'Laptop Review'}"]
}`;
      } else {
        return `${basePrompt}

For a Laptop Review:
- Write in a slightly humorous, engaging tone while remaining informative and helpful
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
- Create a "Pros and Cons" section with at least 3 items each in bulleted lists
- Create a rating system (out of 10) for:
  * Performance: [Score]
  * Display: [Score]
  * Build Quality: [Score]
  * Battery Life: [Score]
  * Value: [Score]
  * Overall: [Score]
- Provide a balanced assessment of strengths and weaknesses
- End with a clear conclusion and recommendation
- After the main content, add space for video with: <div class="video-placeholder"></div>

Format your response as a JSON object with these fields:
{
  "title": "Your generated title",
  "content": "The full HTML-formatted blog post content",
  "excerpt": "A brief 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}`;
      }

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
- Conclude with specific recommendations for different user types
- After the main content, add space for video with: <div class="video-placeholder"></div>

Format your response as a JSON object with these fields:
{
  "title": "Your generated title",
  "content": "The full HTML-formatted blog post content",
  "excerpt": "A brief 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    case 'How-To':
      return `${basePrompt}

For a How-To Guide:
- Start with a clear introduction explaining the goal of the guide
- Break down the process into clear, numbered steps
- Include warnings or notes where things might go wrong
- Add prerequisites or required tools/software
- Use a conversational, instructional tone
- Include troubleshooting tips for common issues
- End with a summary and next steps
- After the main content, add space for video with: <div class="video-placeholder"></div>

Format your response as a JSON object with these fields:
{
  "title": "Your generated title",
  "content": "The full HTML-formatted blog post content",
  "excerpt": "A brief 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    default:
      return `${basePrompt}

Format your response as a JSON object with these fields:
{
  "title": "Your generated title",
  "content": "The full HTML-formatted blog post content",
  "excerpt": "A brief 2-3 sentence summary",
  "tags": ["tag1", "tag2", "tag3"]
}`;
  }
}
