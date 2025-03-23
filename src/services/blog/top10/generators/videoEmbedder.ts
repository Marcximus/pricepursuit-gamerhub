
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
  
  // Find the conclusion section
  const conclusionMatch = content.match(/<h[23]>Conclusion/i);
  
  if (conclusionMatch) {
    // Insert video just before the conclusion
    const conclusionIndex = conclusionMatch.index;
    return content.substring(0, conclusionIndex) + videoEmbed + content.substring(conclusionIndex);
  }
  
  // Fallback: insert at the end if no conclusion found
  return content + videoEmbed;
}

