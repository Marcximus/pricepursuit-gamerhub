
import { ComparisonResult } from "./types.ts";

export function parseComparisonResult(aiContent: string): ComparisonResult {
  console.log('🧹 Cleaning up response...');
  
  // Clean up any potential markdown formatting
  let cleanContent = aiContent.trim()
    .replace(/^```json\s*/, '')
    .replace(/\s*```$/, '');
    
  console.log('🔄 Parsing JSON response...');
  const comparisonResult = JSON.parse(cleanContent);
  
  console.log('🏆 Winner determined:', comparisonResult.winner);
  console.log('📊 Advantages found:', {
    leftCount: comparisonResult.advantages?.left?.length || 0,
    rightCount: comparisonResult.advantages?.right?.length || 0
  });
  
  return comparisonResult;
}
