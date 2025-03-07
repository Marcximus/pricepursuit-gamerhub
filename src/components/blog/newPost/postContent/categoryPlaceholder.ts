
export function getCategoryPlaceholder(category: 'Top10' | 'Review' | 'Comparison' | 'How-To'): string {
  switch (category) {
    case 'Top10':
      return "\n\nTip: You'll be able to upload 11 images (1 header + 10 for each item).";
    case 'Review':
      return "\n\nTip: You'll be able to upload 4 images (1 header + 3 for the review).";
    case 'Comparison':
      return "\n\nTip: You'll be able to upload 4 images (2 for compared laptops + 2 in the article).";
    case 'How-To':
      return "\n\nTip: You'll be able to upload 4 images (1 header + 3 for the guide steps).";
    default:
      return "";
  }
}
