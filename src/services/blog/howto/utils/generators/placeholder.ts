
/**
 * Generate HTML for an image placeholder
 */
export function generateImagePlaceholder(imageNumber: number): string {
  return `<div class="section-image">
    <div class="image-placeholder" id="image-${imageNumber}">
      <p class="placeholder-text">Click to upload image ${imageNumber}</p>
    </div>
  </div>\n`;
}

/**
 * Replace image placeholders in content with proper HTML
 */
export function replaceImagePlaceholders(content: string): string {
  if (!content) return content;
  
  return content.replace(/Image (\d+)/g, (match, number) => {
    return `<div class="image-placeholder" id="image-${number}">
      <p class="placeholder-text">Click to upload image ${number}</p>
    </div>`;
  });
}
