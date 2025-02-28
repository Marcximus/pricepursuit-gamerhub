
import { MatchResult } from "../types";

/**
 * Enhanced regex pattern matcher that returns the matched value
 * @param text Text to search in
 * @param patterns Array of regex patterns to try
 * @returns Object with matched flag and the matched value if found
 */
export function findMatchWithPattern(text: string, patterns: RegExp[]): MatchResult {
  if (!text) return { matched: false };
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      return { matched: true, value: match[0] };
    }
  }
  
  return { matched: false };
}
