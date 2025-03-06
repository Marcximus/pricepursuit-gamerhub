/**
 * Utilities for formatting text into paragraphs
 */

/**
 * Split a longer text into shorter paragraphs for better readability
 * @param text The text to split into paragraphs
 * @returns Array of paragraphs
 */
export const splitIntoParagraphs = (text: string): string[] => {
  // Split text on periods followed by spaces
  const sentences = text.split(/\.\s+/);
  
  if (sentences.length <= 1) {
    return [text];
  }
  
  const paragraphs: string[] = [];
  let currentParagraph = "";
  
  sentences.forEach((sentence, i) => {
    // Add period back if this isn't the last sentence
    const formattedSentence = i < sentences.length - 1 ? sentence + "." : sentence;
    
    if (currentParagraph.length === 0) {
      currentParagraph = formattedSentence;
    } else if (currentParagraph.split(" ").length + formattedSentence.split(" ").length < 20) {
      // If combined would be less than ~20 words, keep in same paragraph
      currentParagraph += " " + formattedSentence;
    } else {
      // Otherwise start a new paragraph
      paragraphs.push(currentParagraph);
      currentParagraph = formattedSentence;
    }
  });
  
  // Add the last paragraph if not empty
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph);
  }
  
  return paragraphs;
};
