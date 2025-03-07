
/**
 * Formats and cleans feature bullet points from product data
 */

/**
 * Extract and clean feature bullet points from product data
 * @param product The product data containing feature bullets
 * @returns An array of cleaned feature strings
 */
export function extractFeatures(product: any): string[] {
  const features: string[] = [];
  
  if (product.feature_bullets) {
    const bulletPoints = product.feature_bullets.slice(0, 3);
    for (const feature of bulletPoints) {
      const cleanFeature = cleanFeatureText(feature);
      if (isValidFeature(cleanFeature)) {
        features.push(cleanFeature);
      }
    }
  }
  
  return features.length > 0 ? features : ["See product details on Amazon"];
}

/**
 * Clean a feature text by removing bullet points and brackets
 * @param featureText The raw feature text
 * @returns Cleaned feature text
 */
function cleanFeatureText(featureText: string): string {
  return featureText
    .replace(/^[•\-\*]\s*/, '')  // Remove bullet points
    .replace(/[\[\]\(\)]/g, '')  // Remove brackets
    .trim();
}

/**
 * Check if a feature text is valid (not empty and of reasonable length)
 * @param featureText The feature text to validate
 * @returns True if the feature is valid
 */
function isValidFeature(featureText: string): boolean {
  return !!featureText && featureText.length > 5 && featureText.length < 80;
}
