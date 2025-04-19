
/**
 * Format step-by-step instructions with better styling
 */
export function formatStepByStepInstructions(content: string): string {
  if (!content) return content;
  
  let processed = content;
  
  // Format step headings
  processed = processed.replace(
    /<h([23])>(Step\s*\d+:|^\d+\.)\s*(.*?)<\/h\1>/g,
    '<div class="step-container">' +
    '<h$1><span class="step-number">$2</span> $3</h$1>' +
    '<div class="step-content">'
  );
  
  // Try to find the end of each step and close the container
  const stepHeadingMatches = [...processed.matchAll(/<div class="step-container">/g)];
  
  if (stepHeadingMatches.length > 0) {
    let contentWithClosings = processed;
    let offset = 0;
    
    for (let i = 0; i < stepHeadingMatches.length; i++) {
      const currentMatch = stepHeadingMatches[i];
      const currentIndex = currentMatch.index! + offset;
      
      let nextStepIndex = Infinity;
      if (i < stepHeadingMatches.length - 1) {
        nextStepIndex = stepHeadingMatches[i + 1].index! + offset;
      }
      
      const afterCurrentStep = contentWithClosings.substring(currentIndex + 30);
      const nextHeadingMatch = afterCurrentStep.match(/<h[23][^>]*>(?!<span class="step-number">)/);
      let nextHeadingIndex = Infinity;
      if (nextHeadingMatch) {
        nextHeadingIndex = currentIndex + 30 + nextHeadingMatch.index!;
      }
      
      const closingPosition = Math.min(nextStepIndex, nextHeadingIndex);
      if (closingPosition !== Infinity) {
        const closingTags = '</div></div>';
        contentWithClosings = 
          contentWithClosings.substring(0, closingPosition) + 
          closingTags + 
          contentWithClosings.substring(closingPosition);
        offset += closingTags.length;
      } else if (i === stepHeadingMatches.length - 1) {
        contentWithClosings += '</div></div>';
      }
    }
    
    processed = contentWithClosings;
  }
  
  return processed;
}
