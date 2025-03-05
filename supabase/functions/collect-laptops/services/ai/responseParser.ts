
/**
 * Parses and validates responses from the DeepSeek API
 */
import { ProcessedLaptopData } from '../../types.ts';

export function parseDeepseekResponse(data: any, laptopData: any): ProcessedLaptopData {
  if (!data.choices?.[0]?.message?.content) {
    console.error('[DeepSeek] Unexpected API response structure:', data);
    throw new Error('Invalid API response structure from DeepSeek');
  }

  // Clean up the content by removing markdown code block syntax and any potential whitespace
  let content = data.choices[0].message.content.trim();
  content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  
  // Log the cleaned content for debugging
  console.log('[DeepSeek] Cleaned content:', content);

  try {
    const processedData = JSON.parse(content);
    return validateAndEnrichData(processedData, laptopData);
  } catch (parseError) {
    console.error('[DeepSeek] Error parsing cleaned content:', {
      error: parseError,
      content: content
    });
    throw new Error('Invalid JSON response from DeepSeek');
  }
}

function validateAndEnrichData(processedData: any, laptopData: any): ProcessedLaptopData {
  // Validate required fields and data structure
  const requiredFields = [
    'asin', 'processor', 'ram', 'storage', 'screen_size', 
    'brand', 'model', 'rating', 'rating_count', 'total_reviews'
  ];
  
  for (const field of requiredFields) {
    if (!processedData.hasOwnProperty(field)) {
      console.error(`[DeepSeek] Missing required field: ${field}`);
      throw new Error(`Invalid JSON structure: missing ${field}`);
    }
  }

  // Validate ASIN matches
  if (processedData.asin !== laptopData.asin) {
    console.error('[DeepSeek] ASIN mismatch:', {
      original: laptopData.asin,
      processed: processedData.asin
    });
    processedData.asin = laptopData.asin;
  }

  // Ensure review_data structure exists
  if (!processedData.review_data) {
    processedData.review_data = {
      rating_breakdown: {
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
        "1": 0
      },
      recent_reviews: []
    };
  }

  // Process any available reviews from laptopData
  if (laptopData.reviews && laptopData.reviews.length > 0) {
    processedData.review_data.recent_reviews = laptopData.reviews.map((review: any) => ({
      rating: review.rating || 0,
      title: review.title || '',
      content: review.content || '',
      reviewer_name: review.reviewer_name || 'Anonymous',
      review_date: review.review_date || new Date().toISOString(),
      verified_purchase: review.verified_purchase || false,
      helpful_votes: review.helpful_votes || 0
    }));
  }

  console.log('[DeepSeek] Successfully processed data:', processedData);
  return processedData as ProcessedLaptopData;
}
