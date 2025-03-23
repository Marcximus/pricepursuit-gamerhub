
import type { ComparisonResult } from "./types.ts";

/**
 * Parse and validate the comparison result from DeepSeek
 */
export function parseComparisonResult(content: string): ComparisonResult {
  try {
    // Attempt to parse the content as JSON
    let parsedContent: ComparisonResult;
    
    try {
      parsedContent = JSON.parse(content);
    } catch (jsonError) {
      console.error('Invalid JSON format returned by DeepSeek');
      
      // Try to extract JSON object if surrounded by other text (fallback)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON from DeepSeek response');
      }
    }
    
    // Validate the required fields
    if (!parsedContent.winner || 
        !parsedContent.analysis || 
        !parsedContent.advantages || 
        !parsedContent.recommendation || 
        !parsedContent.valueForMoney ||
        !parsedContent.specifications) {
      console.error('Missing required fields in DeepSeek response');
      console.error('Response structure:', Object.keys(parsedContent));
      throw new Error('Invalid response structure from DeepSeek');
    }
    
    // Validate winner is one of the allowed values
    if (parsedContent.winner !== 'left' && parsedContent.winner !== 'right' && parsedContent.winner !== 'tie') {
      console.error(`Invalid winner value: ${parsedContent.winner}`);
      throw new Error('Invalid winner value in DeepSeek response');
    }
    
    // Validate advantages is an object with left and right arrays
    if (!parsedContent.advantages.left || !Array.isArray(parsedContent.advantages.left) ||
        !parsedContent.advantages.right || !Array.isArray(parsedContent.advantages.right)) {
      console.error('Invalid advantages structure in DeepSeek response');
      throw new Error('Invalid advantages structure in DeepSeek response');
    }
    
    // Validate valueForMoney is an object with left and right strings
    if (typeof parsedContent.valueForMoney.left !== 'string' || 
        typeof parsedContent.valueForMoney.right !== 'string') {
      console.error('Invalid valueForMoney structure in DeepSeek response');
      throw new Error('Invalid valueForMoney structure in DeepSeek response');
    }
    
    // Validate specifications structure
    if (!parsedContent.specifications ||
        !parsedContent.specifications.left ||
        !parsedContent.specifications.right) {
      console.error('Invalid specifications structure in DeepSeek response');
      throw new Error('Invalid specifications structure in DeepSeek response');
    }
    
    // Handle empty advantages arrays (should have at least one item)
    if (parsedContent.advantages.left.length === 0) {
      parsedContent.advantages.left = ['No specific advantages found'];
    }
    
    if (parsedContent.advantages.right.length === 0) {
      parsedContent.advantages.right = ['No specific advantages found'];
    }
    
    return parsedContent;
  } catch (error) {
    console.error('Error parsing comparison result:', error);
    console.error('Raw content:', content);
    
    // Return a fallback result
    return {
      winner: 'tie',
      analysis: 'Sorry, there was a problem comparing these laptops. The technical details could not be properly analyzed.',
      advantages: {
        left: ['Information unavailable'],
        right: ['Information unavailable']
      },
      recommendation: 'We recommend trying again or selecting different laptops to compare.',
      valueForMoney: {
        left: 'Unable to assess value',
        right: 'Unable to assess value'
      },
      specifications: {
        left: {
          brand: 'Not specified',
          model: 'Not specified',
          price: 'Not specified',
          os: 'Not specified',
          releaseYear: 'Not specified',
          processor: 'Not specified',
          ram: 'Not specified',
          storage: 'Not specified',
          graphics: 'Not specified',
          screenSize: 'Not specified',
          screenResolution: 'Not specified',
          refreshRate: 'Not specified',
          weight: 'Not specified',
          batteryLife: 'Not specified',
          ports: 'Not specified',
          rating: 'Not specified',
          ratingCount: 'Not specified',
          totalReviews: 'Not specified',
          wilsonScore: 'Not specified',
          benchmarkScore: 'Not specified'
        },
        right: {
          brand: 'Not specified',
          model: 'Not specified',
          price: 'Not specified',
          os: 'Not specified',
          releaseYear: 'Not specified',
          processor: 'Not specified',
          ram: 'Not specified',
          storage: 'Not specified',
          graphics: 'Not specified',
          screenSize: 'Not specified',
          screenResolution: 'Not specified',
          refreshRate: 'Not specified',
          weight: 'Not specified',
          batteryLife: 'Not specified',
          ports: 'Not specified',
          rating: 'Not specified',
          ratingCount: 'Not specified',
          totalReviews: 'Not specified',
          wilsonScore: 'Not specified',
          benchmarkScore: 'Not specified'
        }
      }
    };
  }
}
