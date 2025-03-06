
/**
 * Utilities for enhancing recommendation reason text
 */

/**
 * Enhances the reason text to focus on the laptop's strengths
 * @param reason The original recommendation reason
 * @returns Enhanced reason text
 */
export const enhanceReasonText = (reason: string): string => {
  if (!reason) return "";
  
  // Remove phrases like "based on your requirements", "as you requested", etc.
  return reason
    .replace(/based on your requirements/gi, "with exceptional features")
    .replace(/as you requested/gi, "impressively")
    .replace(/according to your needs/gi, "with outstanding capabilities")
    .replace(/you mentioned/gi, "you'll appreciate")
    .replace(/you asked for/gi, "you'll love")
    .replace(/you specified/gi, "you'll benefit from")
    .replace(/aligns with your preferences/gi, "stands out from competitors")
    .replace(/meets your criteria/gi, "excels in performance");
};
