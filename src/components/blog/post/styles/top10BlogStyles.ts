
/**
 * Styles for Top10 blog posts
 */

export const getTop10BlogStyles = (): string => `
  .prose h1 { font-size: 2.5rem; line-height: 1.2; margin-bottom: 1.5rem; text-align: center; }
  .prose h3 { font-size: 1.75rem; line-height: 1.3; margin-top: 2rem; margin-bottom: 1rem; color: #2563eb; }
  .prose hr { margin: 2rem 0; }
  .prose ul.my-4 { margin: 1rem 0; padding-left: 1.5rem; }
  .prose ul.my-4 li { margin-bottom: 0.5rem; list-style-type: none; position: relative; padding-left: 1.5rem; }
  .prose ul.my-4 li:before { content: "✅"; position: absolute; left: 0; }
  .prose p { margin-bottom: 1.25rem; }
  .prose p + p { margin-top: 1.25rem; }
  .prose p:has(+ ul) { margin-bottom: 0.75rem; }
  .prose p:has(emoji-prefix) { margin-top: 1.5rem; margin-bottom: 1.5rem; }
  
  /* Enhanced product card styling */
  .product-card { 
    position: relative; 
    transition: all 0.3s ease;
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 2rem; /* Added margin beneath the product card */
  }
  .product-card:hover { 
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  .product-card .specs-grid { 
    display: grid; 
    grid-template-columns: repeat(2, 1fr); 
    gap: 0.5rem; 
    background-color: #f9fafb; 
    padding: 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
  }
  .product-card .specs-grid div { 
    padding: 0.25rem; 
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .product-card .specs-grid .font-medium {
    color: #4b5563;
    margin-right: 0.25rem;
  }
  .product-card .product-rank { 
    z-index: 10; 
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background-color: #16a34a; /* Ensure green color for ranking badge */
  }
  .product-card img {
    transition: transform 0.3s ease;
  }
  .product-card:hover img {
    transform: scale(1.05);
  }
  .product-card .button-amazon,
  .product-card .check-price-btn {
    transition: all 0.2s ease;
    width: auto !important;
    min-width: 200px !important;
    max-width: 300px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    white-space: nowrap !important;
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
  .product-card .button-amazon:hover,
  .product-card .check-price-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  /* High specificity selectors to override any other styles */
  .product-card .product-title,
  .product-card h3,
  .product-card h4,
  .product-card .text-xl,
  .product-info h3 {
    color: #166534 !important; /* Green color for titles with !important to override other styles */
  }
  /* Ensure all Amazon buttons are green */
  .product-card .btn-view,
  .button-amazon,
  .check-price-btn {
    background-color: #16a34a !important;
    width: auto !important;
    min-width: 200px !important;
    max-width: 300px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    white-space: nowrap !important;
  }
  
  /* Move ratings under the image and center */
  .product-card .product-rating {
    text-align: center !important;
    margin-top: 0.5rem !important;
    margin-bottom: 1rem !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
  
  /* Ensure all subtitles in product cards are green */
  .product-card h3,
  .prose h3,
  .blog-subtitle {
    color: #166534 !important; /* Ensuring green color for subtitles */
  }
  
  /* Enhanced clickable elements styling */
  .product-card a {
    cursor: pointer !important;
    position: relative;
    z-index: 5;
    display: inline-block;
  }
  
  .product-card a:hover {
    text-decoration: underline;
  }
  
  .product-card a img {
    cursor: pointer !important;
  }
  
  .product-card .product-title a {
    color: #166534 !important;
    text-decoration: none;
  }
  
  .product-card .product-title a:hover {
    text-decoration: underline;
  }
  
  /* Center product CTA */
  .product-card .product-cta {
    display: flex !important;
    justify-content: center !important;
  }
`;
