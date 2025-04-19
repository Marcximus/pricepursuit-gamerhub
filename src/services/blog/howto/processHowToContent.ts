
/**
 * Process How-To blog content to ensure proper formatting
 */
export function processHowToContent(content: string, title: string): string {
  if (!content) return '';
  
  // First check if the content is already in JSON format
  try {
    // Check if the entire content is a JSON string
    let jsonContent;
    
    // First, clean up HTML tags like <br/> that might be embedded in the JSON
    const cleanedHtmlContent = content
      .replace(/<br\/>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/<[^>]*>/g, '');
    
    try {
      // Try to parse the cleaned content
      jsonContent = JSON.parse(cleanedHtmlContent);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON pattern
      const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0]
          .replace(/<br\/>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/<[^>]*>/g, '');
        
        try {
          jsonContent = JSON.parse(extractedJson);
        } catch (extractError) {
          console.error('Failed to parse How-To content as JSON:', extractError);
          console.log('Content excerpt that failed parsing:', 
            extractedJson.substring(0, Math.min(300, extractedJson.length)));
          
          // Try parsing with control characters removed
          try {
            const cleanedJson = extractedJson
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
              .replace(/\\u00([0-1][0-9a-fA-F])/g, '');
            jsonContent = JSON.parse(cleanedJson);
          } catch (cleaningError) {
            // If all parsing attempts fail, continue with other methods
            console.error('Failed to parse even after cleaning control characters:', cleaningError);
          }
        }
      }
    }
    
    // If we have a JSON object with content field, use that
    if (jsonContent && typeof jsonContent.content === 'string') {
      let processedContent = jsonContent.content;
      
      // Remove escaped newlines
      processedContent = processedContent
        .replace(/\\n\\n/g, '\n\n')
        .replace(/\\n/g, '\n');
      
      // Remove escaped quotes
      processedContent = processedContent
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      
      // Apply HTML fixes and formatting
      processedContent = cleanupContent(processedContent);
      processedContent = fixHtmlTags(processedContent);
      processedContent = formatTables(processedContent);
      
      // Add video embed if needed
      processedContent = addVideoEmbed(processedContent);
      
      // Replace image placeholders with proper HTML
      processedContent = processedContent.replace(/Image (\d+)/g, (match, number) => {
        return `<div class="image-placeholder" id="image-${number}">
          <p class="placeholder-text">Click to upload image ${number}</p>
        </div>`;
      });
      
      // Add a wrapper class to help with styling
      processedContent = `<div class="how-to-content">${processedContent}</div>`;
      
      // Format FAQ sections
      processedContent = formatFAQSections(processedContent);
      
      // Format step-by-step instructions
      processedContent = formatStepByStepInstructions(processedContent);
      
      return processedContent;
    }
  } catch (error) {
    console.log('Processing How-To content as plain text:', error);
  }
  
  // If not JSON or parsing failed, process as plain text
  let processedContent = cleanupContent(content);
  processedContent = fixHtmlTags(processedContent);
  processedContent = formatTables(processedContent);
  processedContent = addVideoEmbed(processedContent);
  
  // Add a wrapper class to help with styling
  processedContent = `<div class="how-to-content">${processedContent}</div>`;
  
  // Format FAQ sections and step-by-step instructions
  processedContent = formatFAQSections(processedContent);
  processedContent = formatStepByStepInstructions(processedContent);
  
  // If no HTML tags found, wrap in basic HTML
  if (!processedContent.includes('<h1>') && !processedContent.includes('<p>')) {
    processedContent = wrapTextInHtml(processedContent, title);
  }
  
  return processedContent;
}

/**
 * Format FAQ sections with better styling
 */
function formatFAQSections(content: string): string {
  let processed = content;
  
  // Check for FAQ section
  if (processed.includes('<h2>FAQ') || processed.includes('<h2>Frequently Asked Questions')) {
    // Wrap the FAQ section in a div
    processed = processed.replace(
      /(<h2>FAQ.*?<\/h2>|<h2>Frequently Asked Questions.*?<\/h2>)/,
      '<div class="faq-section">$1'
    );
    
    // Find the end of the FAQ section
    const faqEndMatch = processed.match(/<h2>(?!FAQ|Frequently Asked Questions).*?<\/h2>/);
    if (faqEndMatch) {
      const endH2Index = processed.indexOf(faqEndMatch[0]);
      processed = 
        processed.substring(0, endH2Index) + 
        '</div>' + 
        processed.substring(endH2Index);
    } else {
      // If no end found, close the div at the end
      processed += '</div>';
    }
    
    // Format Q&A pairs
    processed = processed.replace(
      /<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/g,
      '<div class="qa-item">' +
      '<div class="question"><h3>Q: $1</h3></div>' +
      '<div class="answer"><p>A: $2</p></div>' +
      '</div>'
    );
  }
  
  // Format Q&A pairs that don't have FAQ heading
  processed = processed.replace(
    /<p>([^<>?]*\?)\s*<\/p>\s*<p>([^<>]*)<\/p>/g,
    '<div class="qa-item">' +
    '<div class="question"><p><strong>Q: $1</strong></p></div>' +
    '<div class="answer"><p>A: $2</p></div>' +
    '</div>'
  );
  
  // Format explicitly marked Q&A content
  processed = processed.replace(
    /<p>(?:Q|Question):\s*(.*?)<\/p>\s*<p>(?:A|Answer):\s*(.*?)<\/p>/gi,
    '<div class="qa-item">' +
    '<div class="question"><p><strong>Q: $1</strong></p></div>' +
    '<div class="answer"><p>A: $2</p></div>' +
    '</div>'
  );
  
  return processed;
}

/**
 * Format step-by-step instructions with better styling
 */
function formatStepByStepInstructions(content: string): string {
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
    // Create a copy of the content that we can modify as we add closing tags
    let contentWithClosings = processed;
    let offset = 0;
    
    for (let i = 0; i < stepHeadingMatches.length; i++) {
      const currentMatch = stepHeadingMatches[i];
      const currentIndex = currentMatch.index! + offset;
      
      // Find where to close this step container - either at the next step or at the next heading
      let nextStepIndex = Infinity;
      if (i < stepHeadingMatches.length - 1) {
        nextStepIndex = stepHeadingMatches[i + 1].index! + offset;
      }
      
      // Find next heading that isn't part of a step
      const afterCurrentStep = contentWithClosings.substring(currentIndex + 30);
      const nextHeadingMatch = afterCurrentStep.match(/<h[23][^>]*>(?!<span class="step-number">)/);
      let nextHeadingIndex = Infinity;
      if (nextHeadingMatch) {
        nextHeadingIndex = currentIndex + 30 + nextHeadingMatch.index!;
      }
      
      // Insert closing tags at the appropriate position
      const closingPosition = Math.min(nextStepIndex, nextHeadingIndex);
      if (closingPosition !== Infinity) {
        const closingTags = '</div></div>';
        contentWithClosings = 
          contentWithClosings.substring(0, closingPosition) + 
          closingTags + 
          contentWithClosings.substring(closingPosition);
        offset += closingTags.length;
      } else if (i === stepHeadingMatches.length - 1) {
        // If this is the last step, close it at the end of the document
        contentWithClosings += '</div></div>';
      }
    }
    
    processed = contentWithClosings;
  }
  
  return processed;
}

/**
 * Get the How-To prompt for AI generation
 */
export { getHowToPrompt };
