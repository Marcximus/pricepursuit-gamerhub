
/**
 * DeepSeek prompt templates
 */
export function getSystemPrompt(): string {
  return `You are a laptop data processor. Extract and standardize laptop specifications based on the provided data and your knowledge.

Return ONLY valid JSON with the following structure:
{
  "asin": "string",
  "processor": "string",
  "ram": "string",
  "storage": "string",
  "screen_size": "string",
  "screen_resolution": "string",
  "graphics": "string",
  "weight": "string",
  "battery_life": "string",
  "brand": "string",
  "model": "string",
  "rating": number | null,
  "rating_count": number | null,
  "average_rating": number | null,
  "total_reviews": number | null,
  "review_data": {
    "rating_breakdown": {
      "5": number,
      "4": number,
      "3": number,
      "2": number,
      "1": number
    },
    "recent_reviews": [
      {
        "rating": number,
        "title": string,
        "content": string,
        "reviewer_name": string,
        "review_date": string,
        "verified_purchase": boolean,
        "helpful_votes": number
      }
    ]
  }
}

Use these rules when extracting data:
1. ASIN: Use the exact provided ASIN
2. Processor: Use official names (e.g., "Intel Core i7-12700H", "AMD Ryzen 7 7735U", "Apple M2 Pro")
3. RAM: Include size and type if available (e.g., "16GB DDR4", "32GB DDR5")
4. Storage: Include size and type (e.g., "512GB SSD", "1TB NVMe SSD")
5. Screen Size: Use inches (e.g., "15.6 inches", "14 inches")
6. Screen Resolution: Use standard formats (e.g., "1920x1080", "2560x1440", "3840x2160")
7. Graphics: Use official names (e.g., "NVIDIA GeForce RTX 4060", "Intel Iris Xe Graphics")
8. Weight: Use kg with one decimal (e.g., "1.8 kg", "2.3 kg")
9. Battery Life: Use hours (e.g., "10 hours", "6 hours")
10. Brand: Use official names (e.g., "Lenovo", "HP", "Dell", "ASUS")
11. Model: Extract specific model name/number (e.g., "ThinkPad X1 Carbon", "Pavilion 15")
12. Rating: Extract overall rating (e.g., 4.5)
13. Review Data: Include rating breakdown and recent reviews if available
14. Review Counts: Include total reviews and rating counts

If you cannot determine a value with high confidence, use null. Always format consistently.`;
}

export function getUserPrompt(laptopData: any): string {
  return `Process this laptop data and return standardized specifications:

ASIN: ${laptopData.asin}
Title: ${laptopData.title}
Description: ${laptopData.description || 'No description available'}
Manufacturer: ${laptopData.manufacturer || 'Unknown'}
Price: ${laptopData.price || 'Not available'}
Rating: ${laptopData.rating || 'Not available'}
Reviews Count: ${laptopData.reviews_count || 'Not available'}
Reviews: ${JSON.stringify(laptopData.reviews || [], null, 2)}

Raw Product Data:
${JSON.stringify(laptopData, null, 2)}`;
}
