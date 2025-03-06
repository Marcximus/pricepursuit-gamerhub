/**
 * Utilities for formatting text into paragraphs
 */

/**
 * Split a longer text into shorter paragraphs for better readability
 * @param text The text to split into paragraphs
 * @returns Array of paragraphs
 */
export const splitIntoParagraphs = (text: string): string[] => {
  // If text is very short, don't split it
  if (text.length < 120) {
    return [text];
  }
  
  // Split text on periods followed by spaces
  const sentences = text.split(/\.\s+/);
  
  // If there are very few sentences, don't split it up further
  if (sentences.length <= 2) {
    return [text];
  }
  
  const paragraphs: string[] = [];
  let currentParagraph = "";
  
  sentences.forEach((sentence, i) => {
    // Add period back if this isn't the last sentence
    const formattedSentence = i < sentences.length - 1 ? sentence + "." : sentence;
    
    if (currentParagraph.length === 0) {
      currentParagraph = formattedSentence;
    } else if (currentParagraph.split(" ").length + formattedSentence.split(" ").length < 25) {
      // If combined would be less than ~25 words, keep in same paragraph
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
  
  // If we end up with no paragraphs, return the original text
  if (paragraphs.length === 0) {
    return [text];
  }
  
  return paragraphs;
};
