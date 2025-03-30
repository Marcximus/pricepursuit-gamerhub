
import { useEffect, useRef } from 'react';
import { BlogPost } from '@/contexts/blog';
import { removeJsonFormatting } from '@/services/blog/top10/contentProcessor';
import { getTop10BlogStyles } from './styles/top10BlogStyles';

interface BlogPostContentProps {
  post: BlogPost;
  content: string;
}

export const BlogPostContent = ({ post, content }: BlogPostContentProps) => {
  const cleanContent = removeJsonFormatting(content);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (post.category === 'Top10' && !document.getElementById('top10-blog-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'top10-blog-styles';
      styleElement.textContent = getTop10BlogStyles();
      document.head.appendChild(styleElement);
    }
    
    return () => {
      const styleElement = document.getElementById('top10-blog-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [post.category]);

  // Effect to ensure all links in product cards are working correctly
  useEffect(() => {
    if (!contentRef.current) return;

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
          
          // Ensure link has product-link class for styling
          if (!link.classList.contains('product-link')) {
            link.classList.add('product-link');
          }
          
          // Add specific roles for accessibility
          if (!link.getAttribute('role')) {
            link.setAttribute('role', 'link');
          }
          
          // Enforce link styling
          link.style.position = 'relative';
          link.style.zIndex = '15';
          link.style.cursor = 'pointer';
          link.style.pointerEvents = 'auto';
          
          // Add direct click event handler as a fallback
          if (!link.onclick) {
            link.onclick = function(e) {
              const href = this.getAttribute('href');
              if (href) {
                window.open(href, '_blank', 'noopener,noreferrer');
                e.stopPropagation();
                return false;
              }
            };
          }
        });
        
        // Specifically target each main clickable component
        const titleLink = card.querySelector('.title-link');
        const imageLink = card.querySelector('.image-link');
        const ratingLink = card.querySelector('.rating-link');
        const priceLink = card.querySelector('.price-link');
        const buttonLink = card.querySelector('.button-link');
        
        // Apply extra styling to each specific component
        [titleLink, imageLink, ratingLink, priceLink, buttonLink].forEach(link => {
          if (link) {
            link.classList.add('direct-link');
            (link as HTMLElement).style.cursor = 'pointer';
            (link as HTMLElement).style.pointerEvents = 'auto';
          }
        });
        
        // Make sure product title is clickable if it doesn't have a link already
        const productTitle = card.querySelector('.product-title');
        if (productTitle && !productTitle.querySelector('a')) {
          const buttonLink = card.querySelector('.button-link') as HTMLAnchorElement;
          if (buttonLink) {
            const titleLink = document.createElement('a');
            titleLink.href = buttonLink.href;
            titleLink.target = '_blank';
            titleLink.rel = 'nofollow noopener';
            titleLink.className = 'product-link title-link';
            
            // Move the title's inner content to the link
            while (productTitle.firstChild) {
              titleLink.appendChild(productTitle.firstChild);
            }
            productTitle.appendChild(titleLink);
          }
        }
        
        // Ensure image is wrapped in a link
        const productImage = card.querySelector('img:not(.fallback-image)');
        const imageWrapper = productImage?.parentElement;
        if (productImage && imageWrapper && !imageWrapper.tagName.toLowerCase() === 'a') {
          const buttonLink = card.querySelector('.button-link') as HTMLAnchorElement;
          if (buttonLink) {
            const imageLink = document.createElement('a');
            imageLink.href = buttonLink.href;
            imageLink.target = '_blank';
            imageLink.rel = 'nofollow noopener';
            imageLink.className = 'product-link image-link block';
            
            imageWrapper.insertBefore(imageLink, productImage);
            imageLink.appendChild(productImage);
          }
        }
      });
    };

    // Run immediately after render
    fixProductCardLinks();

    // Use MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver(fixProductCardLinks);
    observer.observe(contentRef.current, { childList: true, subtree: true });

    // Add additional click handler at the container level
    const handleContainerClick = (e: MouseEvent) => {
      // Fix TypeScript error by properly casting the target
      const target = e.target as HTMLElement;
      
      // Check if the click is on or inside a product card
      const productCard = target.closest('.product-card');
      if (!productCard) return;

      // If the click is directly on a link, let the default behavior happen
      if (target.tagName === 'A' || target.closest('a')) {
        return;
      }

      // If the click is on the card but not on a link, find the main link and click it
      const mainLink = productCard.querySelector('.button-link') || 
                      productCard.querySelector('.title-link');
      if (mainLink) {
        e.preventDefault();
        e.stopPropagation();
        (mainLink as HTMLElement).click();
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('click', handleContainerClick as EventListener);
    }

    return () => {
      observer.disconnect();
      if (contentRef.current) {
        contentRef.current.removeEventListener('click', handleContainerClick as EventListener);
      }
    };
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none" 
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};
