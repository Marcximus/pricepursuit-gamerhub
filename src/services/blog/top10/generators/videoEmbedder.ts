
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
  
  // First look for conclusion section with various heading formats
  const conclusionRegex = /<h[1-6][^>]*>\s*(?:conclusion|summary|final thoughts|wrapping up|in conclusion|to sum up)/i;
  const conclusionMatch = content.match(conclusionRegex);
  
  if (conclusionMatch && conclusionMatch.index !== undefined) {
    // Find the end of the conclusion section
    const startIndex = conclusionMatch.index;
    let endIndex = content.length;
    
    // Look for the next heading after conclusion, if any
    const nextHeadingMatch = content.slice(startIndex + conclusionMatch[0].length).match(/<h[1-6][^>]*>/i);
    if (nextHeadingMatch && nextHeadingMatch.index !== undefined) {
      endIndex = startIndex + conclusionMatch[0].length + nextHeadingMatch.index;
    } else {
      // If no next heading, find the last paragraph in conclusion
      const paragraphs = [...content.slice(startIndex).matchAll(/<\/p>/gi)];
      if (paragraphs.length > 0) {
        const lastParagraph = paragraphs[paragraphs.length - 1];
        if (lastParagraph.index !== undefined) {
          endIndex = startIndex + lastParagraph.index + 4; // 4 for '</p>'
        }
      }
    }
    
    // Insert video after the conclusion section
    console.log('✅ Inserting video after conclusion section');
    return content.substring(0, endIndex) + videoEmbed + content.substring(endIndex);
  }
  
  // If no conclusion section is found, try to put it at the end of the content
  // Look for the last paragraph or div
  const lastElementMatch = content.match(/(<\/p>|<\/div>)[^<]*$/i);
  if (lastElementMatch && lastElementMatch.index !== undefined) {
    const insertPosition = lastElementMatch.index + lastElementMatch[0].length;
    console.log('✅ No conclusion found, adding video at the end of content');
    return content.substring(0, insertPosition) + videoEmbed + content.substring(insertPosition);
  }
  
  // Final fallback: append at the end
  console.log('⚠️ No ideal position found, appending video at the end');
  return content + videoEmbed;
}
