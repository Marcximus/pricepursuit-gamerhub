
/**
 * Find the end of the introduction section
 */
export function findIntroductionEnd(content: string): number {
  // Find the first h1 or h2 tag (intro heading)
  const introHeadingRegex = /<h[12][^>]*>/;
  const introMatch = content.match(introHeadingRegex);
  
  if (!introMatch) return 0;
  
  // Get content after the introduction section
  const introEnd = introMatch.index! + introMatch[0].length;
  const firstParagraphRegex = /<\/p>/;
  const firstParagraphMatch = content.substring(introEnd).match(firstParagraphRegex);
  
  if (firstParagraphMatch) {
    return introEnd + firstParagraphMatch.index! + 4; // 4 is the length of </p>
  }
  
  return introEnd;
}

/**
 * Find all h2 headings in content after a specific index
 */
export function findH2Headings(content: string, startIndex: number = 0): Array<{ index: number, match: string }> {
  const h2Regex = /<h2[^>]*>/g;
  const matches = Array.from(content.substring(startIndex).matchAll(h2Regex));
  
  return matches.map(match => ({
    index: startIndex + match.index!,
    match: match[0]
  }));
}
