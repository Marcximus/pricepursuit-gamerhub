
/**
 * Extract consolidated description text
 */
export function extractDescription(content: any): string {
  const descriptionParts = [];
  
  // Add the main description if present
  if (content.description && typeof content.description === 'string') {
    descriptionParts.push(content.description);
  }
  
  // Add bullet points if present
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    descriptionParts.push(content.bullet_points);
  }
  
  return descriptionParts.join('\n\n');
}
