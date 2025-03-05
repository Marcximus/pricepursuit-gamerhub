
/**
 * Main service for processing laptop data with DeepSeek AI
 */
import { OxylabsResult, ProcessedLaptopData } from '../../types.ts';
import { callDeepseekAPI } from './deepseekClient.ts';
import { getSystemPrompt, getUserPrompt } from './prompts.ts';
import { parseDeepseekResponse } from './responseParser.ts';

export async function processWithDeepseek(laptopData: OxylabsResult): Promise<ProcessedLaptopData> {
  console.log('[DeepSeek] Processing laptop:', {
    title: laptopData.title,
    asin: laptopData.asin,
    price: laptopData.price,
    rating: laptopData.rating,
    reviews_count: laptopData.reviews_count,
    manufacturer: laptopData.manufacturer
  });

  try {
    const systemPrompt = getSystemPrompt();
    const userPrompt = getUserPrompt(laptopData);

    const data = await callDeepseekAPI(systemPrompt, userPrompt);
    
    console.log('[DeepSeek] Response received:', {
      model: data.model,
      tokens: data.usage?.total_tokens || 'unknown'
    });

    return parseDeepseekResponse(data, laptopData);
  } catch (error) {
    console.error('[DeepSeek] Processing error:', error);
    throw error;
  }
}
