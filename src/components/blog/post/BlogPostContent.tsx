
import { useEffect, useRef, useState } from 'react';
import { BlogPost } from '@/contexts/blog';
import { removeJsonFormatting } from '@/services/blog/top10/contentProcessor';

interface BlogPostContentProps {
  post: BlogPost;
  content: string;
}

export const BlogPostContent = ({ post, content }: BlogPostContentProps) => {
  const cleanContent = removeJsonFormatting(content);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imagesProcessed, setImagesProcessed] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    // Fix product card links
    const fixProductCardLinks = () => {
      const productCards = contentRef.current?.querySelectorAll('.product-card');
      
      productCards?.forEach(card => {
        // Find all the clickable elements in each card
        const links = card.querySelectorAll('a');
        
        // Make sure they have the correct attributes
        links.forEach(link => {
          if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
          }
          if (!link.getAttribute('rel')) {
            link.setAttribute('rel', 'nofollow noopener');
          }
          // Ensure z-index is set for proper stacking context
          link.style.position = 'relative';
          link.style.zIndex = '5';
          // Make sure cursor is pointer
          link.style.cursor = 'pointer';
        });
      });
    };

    // Fix How-To image spacing and positioning
    const fixHowToImageSpacing = () => {
      if (post.category !== 'How-To') return;
      
      // Fix image styling
      const howToImages = contentRef.current?.querySelectorAll('.how-to-image');
      howToImages?.forEach(img => {
        // Make sure image is responsive
        (img as HTMLElement).style.maxWidth = '100%';
        (img as HTMLElement).style.height = 'auto';
      });
      
      // Ensure section images are properly positioned
      const sectionImages = contentRef.current?.querySelectorAll('.section-image');
      
      // Check if any image appears before the first heading or paragraph
      sectionImages?.forEach((sectionImage) => {
        const rect = sectionImage.getBoundingClientRect();
        const contentRect = contentRef.current?.getBoundingClientRect();
        
        // Get the previous element (to check if it's a heading)
        const prevElement = sectionImage.previousElementSibling;
        const nextElement = sectionImage.nextElementSibling;
        
        // If this image appears at the very beginning before any content, move it after the first paragraph
        if (rect.top < (contentRect?.top || 0) + 100 && 
            (!prevElement || prevElement.tagName === 'BR' || prevElement.tagName === 'DIV')) {
          console.log('Image appears too early in the content, repositioning');
          
          // Find the first paragraph or heading after introduction
          const firstHeading = contentRef.current?.querySelector('h1, h2');
          const firstParagraphAfterHeading = firstHeading?.nextElementSibling;
          
          if (firstParagraphAfterHeading) {
            // Move the image after the first paragraph following the heading
            firstParagraphAfterHeading.after(sectionImage);
          } else if (firstHeading) {
            // If no paragraph after heading, place after heading
            firstHeading.after(sectionImage);
          }
        }
        
        // If next element is not a heading (h2, h3, etc.), add adequate spacing
        if (nextElement && !nextElement.tagName.match(/^H[1-6]$/)) {
          (sectionImage as HTMLElement).style.marginBottom = '2rem';
        } else {
          // Add spacing between image and heading
          (sectionImage as HTMLElement).style.marginBottom = '1rem';
        }
      });
      
      setImagesProcessed(true);
    };

    // Run immediately after render
    fixProductCardLinks();
    fixHowToImageSpacing();

    // Use MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver(() => {
      fixProductCardLinks();
      fixHowToImageSpacing();
    });
    
    observer.observe(contentRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [content, post.category]);

  return (
    <div 
      ref={contentRef}
      className={`prose prose-lg max-w-none ${post.category === 'How-To' ? 'how-to-content' : ''}`} 
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};
