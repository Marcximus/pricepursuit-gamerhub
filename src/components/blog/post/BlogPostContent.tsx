
import { useEffect } from 'react';
import { BlogPost } from '@/contexts/blog';

interface BlogPostContentProps {
  post: BlogPost;
  content: string;
}

export const BlogPostContent = ({ post, content }: BlogPostContentProps) => {
  // Clean up any leftover JSON formatting in the content
  const cleanContent = content
    // Remove JSON syntax markers
    .replace(/```json\s*\{/g, '')
    .replace(/\}\s*```/g, '')
    // Remove title field
    .replace(/"title"\s*:\s*".*?",?/g, '')
    // Remove content field markers
    .replace(/"content"\s*:\s*"/g, '')
    // Remove excerpt field
    .replace(/,?\s*"excerpt"\s*:\s*".*?",?/g, '')
    // Remove tags field
    .replace(/,?\s*"tags"\s*:\s*\[.*?\],?/g, '')
    // Remove trailing quotation marks
    .replace(/"\s*$/g, '')
    // Remove any other JSON syntax that might be visible
    .replace(/^{/g, '')
    .replace(/}$/g, '')
    // Remove trailing commas and quotes that might be visible
    .replace(/,\s*"(?:excerpt|tags)":/g, '')
    .replace(/,\s*$/g, '')
    // Clean up any double quotes that might be visible around text
    .replace(/^"/, '')
    .replace(/"$/, '');

  useEffect(() => {
    // Add styling for Top10 list items if not already present
    if (post.category === 'Top10' && !document.getElementById('top10-blog-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'top10-blog-styles';
      styleElement.textContent = `
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
        .product-card { position: relative; }
        .product-card .specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        .product-card .specs-grid div { padding: 0.25rem; }
        .product-card .product-rank { z-index: 10; }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Clean up
    return () => {
      const styleElement = document.getElementById('top10-blog-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [post.category]);

  return (
    <div 
      className="prose prose-lg max-w-none" 
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};
