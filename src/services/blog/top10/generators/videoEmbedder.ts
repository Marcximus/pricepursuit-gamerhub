
export function addVideoEmbed(content: string): string {
  console.log('📼 Preparing Humix video embed');
  
  // Check if the content already has a Humix player
  if (content.includes('humixPlayers') || content.includes('humix-player')) {
    console.log('✅ Humix player already exists in content');
    return content;
  }
  
  // Prepare the video embed code
  const videoEmbed = `
<div class="my-6">
  <h2 class="text-2xl font-bold mb-4">Video Review</h2>
  <div class="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
    <div class="humix-player" data-video-id="BznUvXxNGnk0" data-account="88269" data-player-code="b83efd77"></div>
    <script>var humixPlayers = humixPlayers || []; humixPlayers.push("b83efd77");</script>
  </div>
</div>
`;
  
  // First try to find conclusion section with various heading formats
  const conclusionRegex = /<h[1-6][^>]*>\s*(?:conclusion|summary|final thoughts|wrapping up|in conclusion|to sum up)/i;
  const conclusionMatch = content.match(conclusionRegex);
  
  if (conclusionMatch && conclusionMatch.index !== undefined) {
    // Insert video just before the conclusion
    console.log('✅ Inserting video before conclusion section');
    return content.substring(0, conclusionMatch.index) + videoEmbed + content.substring(conclusionMatch.index);
  }
  
  // If no conclusion section is found, try to put it before the last heading
  // This works well for posts that don't have an explicit conclusion section
  const headings = [...content.matchAll(/<h[1-6][^>]*>/gi)];
  if (headings.length > 1) {
    // Get the last or second-to-last heading (to avoid putting it before "Related Posts" or similar)
    const lastHeadingIndex = headings[headings.length - 1].index;
    const secondLastHeadingIndex = headings.length > 2 ? headings[headings.length - 2].index : lastHeadingIndex;
    
    // Choose the appropriate position
    const insertIndex = secondLastHeadingIndex !== undefined ? secondLastHeadingIndex : lastHeadingIndex;
    
    if (insertIndex !== undefined) {
      console.log('✅ Inserting video before the last main section');
      return content.substring(0, insertIndex) + videoEmbed + content.substring(insertIndex);
    }
  }
  
  // If no good position is found in the structure, insert near the end
  // Find the last paragraph tag
  const paragraphs = [...content.matchAll(/<\/p>/gi)];
  if (paragraphs.length > 0) {
    const lastParagraphIndex = paragraphs[paragraphs.length - 1].index;
    if (lastParagraphIndex !== undefined) {
      const endOfLastParagraph = lastParagraphIndex + 4; // Length of '</p>'
      console.log('✅ Inserting video after the last paragraph');
      return content.substring(0, endOfLastParagraph) + videoEmbed + content.substring(endOfLastParagraph);
    }
  }
  
  // Final fallback: insert at the end
  console.log('⚠️ No ideal position found, appending video at the end');
  return content + videoEmbed;
}
