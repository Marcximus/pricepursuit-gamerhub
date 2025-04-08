
/**
 * Specialized module for processing and formatting content
 */

/**
 * Process content for proper HTML rendering
 */
export function processContent(content: string): string {
  // Remove any escaped newlines and replace with proper HTML
  let processedContent = content
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n([^<])/g, '<br/>$1');
  
  // Ensure proper HTML structure with tags
  if (!processedContent.includes('<h1>') && !processedContent.includes('<h2>')) {
    // If no heading tags, wrap content in proper HTML structure
    const lines = processedContent.split(/\n\n|\r\n\r\n/);
    if (lines.length > 1) {
      const title = lines[0];
      const rest = lines.slice(1).join('\n\n');
      processedContent = `<h1>${title}</h1><p>${rest}</p>`;
    }
  }
  
  // Fix table formatting issues - common in How-To blogs
  if (processedContent.includes('Term') && processedContent.includes('What It Means')) {
    console.log('🔍 Detected table structure, fixing formatting...');
    // Extract table data
    const tableMatch = processedContent.match(/Term([\s\S]*?)(?=<\/p>|<h2>|$)/);
    if (tableMatch) {
      const tableText = tableMatch[0];
      // Create proper HTML table
      const rows = tableText.split('\n').filter(line => line.trim().length > 0);
      let htmlTable = '<table class="w-full border-collapse border border-gray-300 my-4"><thead><tr>';
      
      // Process header row
      const headers = rows[0].split('\t').map(h => h.trim());
      headers.forEach(header => {
        htmlTable += `<th class="border border-gray-300 px-4 py-2">${header}</th>`;
      });
      htmlTable += '</tr></thead><tbody>';
      
      // Process data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('\t').map(c => c.trim());
        htmlTable += '<tr>';
        cells.forEach(cell => {
          htmlTable += `<td class="border border-gray-300 px-4 py-2">${cell}</td>`;
        });
        htmlTable += '</tr>';
      }
      htmlTable += '</tbody></table>';
      
      // Replace the text table with HTML table
      processedContent = processedContent.replace(tableText, htmlTable);
    }
  }
  
  // Fix image placeholders for How-To blogs
  processedContent = processedContent
    .replace(/Image (\d+)/g, '<div class="image-placeholder"></div>')
    .replace(/\[Image (\d+)\]/g, '<div class="image-placeholder"></div>');
    
  // Enhance Q&A sections in How-To blogs
  processedContent = enhanceQASections(processedContent);
  
  // Log content length for debugging
  console.log('📄 Final content length after processing:', processedContent.length, 'characters');
  
  return processedContent;
}

/**
 * Enhance Q&A sections with better formatting
 */
function enhanceQASections(content: string): string {
  // Identify common question patterns and enhance them with proper HTML structure
  let enhancedContent = content;
  
  // Pattern 1: FAQ sections with questions as h3 and answers as paragraphs
  if (enhancedContent.includes('<h2>FAQ') || enhancedContent.includes('<h2>Frequently Asked Questions')) {
    console.log('🔍 Detected FAQ section, enhancing formatting...');
    
    // Replace h3 questions with styled question boxes
    enhancedContent = enhancedContent.replace(
      /<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/g,
      '<div class="qa-item">' +
      '<div class="question"><h3>Q: $1</h3></div>' +
      '<div class="answer"><p>A: $2</p></div>' +
      '</div>'
    );
  }
  
  // Pattern 2: Question-style paragraphs (ending with ?)
  enhancedContent = enhancedContent.replace(
    /<p>([^<>?]*\?)\s*<\/p>\s*<p>([^<>]*)<\/p>/g,
    '<div class="qa-item">' +
    '<div class="question"><p><strong>Q: $1</strong></p></div>' +
    '<div class="answer"><p>A: $2</p></div>' +
    '</div>'
  );
  
  // Pattern 3: "Q:" and "A:" prefixed paragraphs
  enhancedContent = enhancedContent.replace(
    /<p>(?:Q|Question):\s*(.*?)<\/p>\s*<p>(?:A|Answer):\s*(.*?)<\/p>/gi,
    '<div class="qa-item">' +
    '<div class="question"><p><strong>Q: $1</strong></p></div>' +
    '<div class="answer"><p>A: $2</p></div>' +
    '</div>'
  );
  
  // Add a special class for FAQs section
  if (enhancedContent.includes('<h2>FAQ') || enhancedContent.includes('<h2>Frequently Asked Questions')) {
    enhancedContent = enhancedContent.replace(
      /(<h2>FAQ.*?<\/h2>|<h2>Frequently Asked Questions.*?<\/h2>)/,
      '<div class="faq-section">$1'
    );
    
    // Find where the FAQ section likely ends
    const faqEndMatch = enhancedContent.match(/<h2>(?!FAQ|Frequently Asked Questions).*?<\/h2>/);
    if (faqEndMatch) {
      const endH2Index = enhancedContent.indexOf(faqEndMatch[0]);
      enhancedContent = 
        enhancedContent.substring(0, endH2Index) + 
        '</div>' + 
        enhancedContent.substring(endH2Index);
    } else {
      // If no end found, close the div at the end
      enhancedContent += '</div>';
    }
  }
  
  // Handle step-by-step instructions with better formatting
  enhancedContent = enhanceStepByStepInstructions(enhancedContent);
  
  return enhancedContent;
}

/**
 * Enhance step-by-step instructions with better formatting
 */
function enhanceStepByStepInstructions(content: string): string {
  let enhancedContent = content;
  
  // Pattern: Step X: or X. followed by instruction text
  enhancedContent = enhancedContent.replace(
    /<h([23])>(Step\s*\d+:|^\d+\.)\s*(.*?)<\/h\1>/g,
    '<div class="step-container">' +
    '<h$1><span class="step-number">$2</span> $3</h$1>' +
    '<div class="step-content">'
  );
  
  // Close the step containers before the next heading
  const stepHeadingMatches = [...enhancedContent.matchAll(/<div class="step-container">/g)];
  
  if (stepHeadingMatches.length > 0) {
    // Create a copy of the content that we can modify as we add closing tags
    let contentWithClosings = enhancedContent;
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
    
    enhancedContent = contentWithClosings;
  }
  
  return enhancedContent;
}
