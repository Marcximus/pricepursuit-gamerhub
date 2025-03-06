
/**
 * Utilities for adding emojis to recommendation text
 */

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
