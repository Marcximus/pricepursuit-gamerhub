
/**
 * Format FAQ sections with better styling
 */
export function formatFAQSections(content: string): string {
  if (!content) return content;
  
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
