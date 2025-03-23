
/**
 * Video embedding utilities for Top10 blog posts
 */

/**
 * Add a Humix video embed to the content if not already present
 */
export function addVideoEmbed(content: string): string {
  console.log('📼 Adding Humix video embed to content');
  
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
  
  // Find a good position to insert the video
  // Aim for after the introduction but before the first product
  const firstH3Index = content.indexOf('<h3');
  if (firstH3Index > 0) {
    // Insert before the first product heading
    return content.substring(0, firstH3Index) + videoEmbed + content.substring(firstH3Index);
  }
  
  // Fallback: insert at the end
  return content + videoEmbed;
}
