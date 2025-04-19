
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
      
      // Ensure section images are properly positioned before headings
      const sectionImages = contentRef.current?.querySelectorAll('.section-image');
      let hiddenFirstImage = false;
      
      sectionImages?.forEach((sectionImage, index) => {
        const nextElement = sectionImage.nextElementSibling;
        
        // If next element is not a heading (h2, h3, etc.), adjust spacing
        if (nextElement && !nextElement.tagName.match(/^H[1-6]$/)) {
          (sectionImage as HTMLElement).style.marginBottom = '2rem';
        } else {
          // Add spacing between image and heading
          (sectionImage as HTMLElement).style.marginBottom = '1rem';
        }
        
        // Only hide the first image if it appears before any headings and is at the very top
        // This ensures we don't hide images that should be displayed
        if (!hiddenFirstImage && index === 0) {
          const isFirstContentElement = isFirstElement(sectionImage);
          const isBeforeHeading = isBeforeAnyHeading(sectionImage);
          const isAtVeryTop = sectionImage.getBoundingClientRect().top < 300;
          
          if (isFirstContentElement && isBeforeHeading && isAtVeryTop) {
            console.log('Hiding first image that appears at the very top');
            (sectionImage as HTMLElement).style.display = 'none';
            hiddenFirstImage = true;
          }
        }
      });
      
      setImagesProcessed(true);
    };
    
    // Helper function to determine if an element is the first element in its parent
    const isFirstElement = (element: Element): boolean => {
      let previousElement = element.previousElementSibling;
      // Skip text nodes and comments
      while (previousElement && 
            (previousElement.nodeType !== Node.ELEMENT_NODE || 
             previousElement.tagName === 'BR' || 
             (previousElement as HTMLElement).style.display === 'none')) {
        previousElement = previousElement.previousElementSibling;
      }
      return !previousElement;
    };
    
    // Helper function to check if image is before any heading
    const isBeforeAnyHeading = (element: Element): boolean => {
      const headings = contentRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (!headings || headings.length === 0) return true;
      
      const imageRect = element.getBoundingClientRect();
      for (const heading of Array.from(headings)) {
        const headingRect = heading.getBoundingClientRect();
        if (imageRect.top < headingRect.top) {
          return true;
        }
      }
      return false;
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
