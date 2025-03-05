/**
 * Utility functions for formatting text with emojis and paragraphs
 */

import React from 'react';

// Keyword to emoji mapping for smart emoji insertion
interface KeywordEmoji {
  terms: string[];
  emoji: string;
}

const KEYWORDS_TO_EMOJIS: KeywordEmoji[] = [
  { terms: ['powerful', 'performance', 'fast', 'speed'], emoji: '🚀' },
  { terms: ['graphics', 'gaming', 'display', 'visual'], emoji: '🎮' },
  { terms: ['battery', 'life', 'long-lasting'], emoji: '🔋' },
  { terms: ['lightweight', 'portable', 'thin'], emoji: '🪶' },
  { terms: ['professional', 'work', 'productivity'], emoji: '💼' },
  { terms: ['budget', 'affordable', 'value'], emoji: '💰' },
  { terms: ['storage', 'memory', 'ram'], emoji: '💾' },
  { terms: ['screen', 'display', 'resolution'], emoji: '🖥️' },
  { terms: ['innovative', 'modern', 'latest'], emoji: '✨' },
  { terms: ['perfect', 'ideal', 'excellent'], emoji: '🏆' }
];

const GENERAL_EMOJIS = ['👍', '⭐', '🔥', '👌', '😎'];

/**
 * Add relevant emojis to text based on its content
 * @param text The text to add emojis to
 * @returns Text with emojis inserted in appropriate locations
 */
export const addEmojisToText = (text: string): string => {
  let emojiText = text;
  let emojisAdded = 0;
  
  // Only add up to 2 emojis per paragraph
  KEYWORDS_TO_EMOJIS.forEach(({ terms, emoji }) => {
    if (emojisAdded >= 2) return;
    
    const lowerText = emojiText.toLowerCase();
    if (terms.some(term => lowerText.includes(term.toLowerCase()))) {
      // Add emoji at start or end with a preference for end placement for more natural feel
      if (Math.random() < 0.3 && !emojiText.startsWith(emoji)) {
        emojiText = `${emoji} ${emojiText}`;
        emojisAdded++;
      } else if (!emojiText.endsWith(emoji)) {
        emojiText = `${emojiText} ${emoji}`;
        emojisAdded++;
      }
    }
  });
  
  // If no emojis were added, add a general positive one
  if (emojisAdded === 0) {
    const randomEmoji = GENERAL_EMOJIS[Math.floor(Math.random() * GENERAL_EMOJIS.length)];
    emojiText = `${emojiText} ${randomEmoji}`;
  }
  
  return emojiText;
};

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

/**
 * Formats the text for the recommendation reasons
 * @param reason The recommendation reason text
 * @returns Formatted paragraphs with emojis
 */
export const formatRecommendationReason = (reason: string): string[] => {
  if (!reason) return ["No details available 🤔"];
  
  // If it's a short reason, just add emojis without splitting
  if (!reason.includes('.') || reason.split('.').length <= 1) {
    const emojiReason = addEmojisToText(reason);
    return [emojiReason];
  }
  
  // For longer text, split into paragraphs
  const paragraphs = splitIntoParagraphs(reason);
  
  // Add emojis to each paragraph
  return paragraphs.map(paragraph => addEmojisToText(paragraph));
};
