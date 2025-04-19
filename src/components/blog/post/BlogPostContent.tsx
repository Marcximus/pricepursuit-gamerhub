
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
      
      // Process all section images
      sectionImages?.forEach((sectionImage) => {
        // Find all h2 elements
        const allH2s = contentRef.current?.querySelectorAll('h2');
        if (!allH2s || allH2s.length === 0) return;
        
        // Get the image's position
        const imgRect = sectionImage.getBoundingClientRect();
        
        // Check if the image is in a good position relative to h2 elements
        let needsRepositioning = true;
        let targetH2 = null;
        
        // Check if the image is already positioned correctly before an h2
        for (let i = 0; i < allH2s.length; i++) {
          const h2Rect = allH2s[i].getBoundingClientRect();
          
          // If image is right before an h2 (within 100px), it's good
          if (Math.abs(imgRect.bottom - h2Rect.top) < 100 && imgRect.top < h2Rect.top) {
            needsRepositioning = false;
            break;
          }
          
          // Find the next h2 to position this image before
          if (imgRect.top < h2Rect.top && !targetH2) {
            targetH2 = allH2s[i];
          }
        }
        
        // If the image needs repositioning and we found a target h2
        if (needsRepositioning && targetH2) {
          // Move the image right before the h2
          targetH2.parentNode?.insertBefore(sectionImage, targetH2);
          
          // Add proper spacing
          (sectionImage as HTMLElement).style.marginBottom = '1.5rem';
        }
        
        // Ensure proper spacing between image and surrounding content
        (sectionImage as HTMLElement).style.marginTop = '2rem';
        (sectionImage as HTMLElement).style.marginBottom = '2rem';
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
