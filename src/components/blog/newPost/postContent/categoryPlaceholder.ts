
/**
 * Gets the placeholder text for different blog post categories
 */
export function getCategoryPlaceholder(category: string | undefined): string {
  switch (category) {
    case 'Top10':
      return '\n\nExample format:\n<h2>10. Product Name</h2>\n<div class="product-details">\n  <img src="product-image-url" alt="Product Name" />\n  <div class="specs">\n    <p><strong>Processor:</strong> Intel Core i7</p>\n    <p><strong>RAM:</strong> 16GB</p>\n    <p><strong>Storage:</strong> 512GB SSD</p>\n  </div>\n</div>\n<p>Product description and review...</p>';
    
    case 'Review':
      return '\n\nExample format:\n<h2>Design & Build Quality</h2>\n<p>Detailed review of the design...</p>\n<h2>Performance</h2>\n<p>Benchmarks and real-world performance...</p>\n<h2>Pros & Cons</h2>\n<ul>\n  <li>Pro 1</li>\n  <li>Pro 2</li>\n</ul>\n<h2>Verdict</h2>\n<p>Overall recommendation...</p>';
    
    case 'Comparison':
      return '\n\nExample format:\n<h2>Design Comparison</h2>\n<div class="comparison-table">\n  <table>\n    <tr>\n      <th>Feature</th>\n      <th>Product A</th>\n      <th>Product B</th>\n    </tr>\n    <tr>\n      <td>Weight</td>\n      <td>1.8 kg</td>\n      <td>2.1 kg</td>\n    </tr>\n  </table>\n</div>';
    
    case 'How-To':
      return '\n\nExample format:\n<h2>Step 1: Preparation</h2>\n<p>Instructions for preparation...</p>\n<div class="image-placeholder" id="image-1"><p>Image 1: Screenshot showing the settings menu</p></div>\n<h2>Step 2: Installation</h2>\n<p>Installation instructions...</p>\n<h2>FAQs</h2>\n<h3>Common Question 1?</h3>\n<p>Answer to the question...</p>';
    
    default:
      return '';
  }
}
