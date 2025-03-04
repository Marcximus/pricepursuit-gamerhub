
// Utility file to handle specification info lookup

/**
 * Get the emoji and tooltip information for a specification type
 */
export const getSpecInfo = (title: string) => {
  switch (title.toLowerCase()) {
    case "brand":
      return {
        emoji: "🏢",
        tooltip: "The manufacturer of the laptop."
      };
    case "model":
      return {
        emoji: "📱",
        tooltip: "The specific model name or number of the laptop."
      };
    case "rating count":
      return {
        emoji: "👥",
        tooltip: "The number of user ratings this laptop has received. Higher numbers indicate more user feedback."
      };
    case "total reviews":
      return {
        emoji: "📝",
        tooltip: "The total number of written reviews. More reviews can give you better insights about real-world usage."
      };
    case "benchmark score":
      return {
        emoji: "🚀",
        tooltip: "Overall performance score calculated based on processor (35%), RAM (20%), storage (15%), graphics (20%), and screen resolution (10%). Higher values indicate better overall system performance."
      };
    case "processor score":
      return {
        emoji: "⚡",
        tooltip: "CPU performance score based on processor type, generation, and model. For example, Apple M3 Ultra (95), Intel i9 (90), AMD Ryzen 9 (88), Intel i7/M2 (80), Intel i5/M1 (70), Intel i3 (50), Celeron/Pentium (30). Higher values indicate faster processing capabilities."
      };
    case "wilson score":
      return {
        emoji: "⭐",
        tooltip: "Statistical confidence rating that considers both rating value and number of ratings. Calculated using the lower bound of Wilson score confidence interval for a Bernoulli parameter. A more reliable measure than simple rating average, especially when comparing items with different numbers of ratings."
      };
    case "rating":
      return {
        emoji: "★",
        tooltip: "Average user rating out of 5 stars."
      };
    case "price":
      return {
        emoji: "💰",
        tooltip: "Current price of the laptop."
      };
    case "processor":
      return {
        emoji: "🧠",
        tooltip: "The central processing unit (CPU) that powers the laptop."
      };
    case "ram":
      return {
        emoji: "🧮",
        tooltip: "Random Access Memory - affects multitasking capability. More is generally better."
      };
    case "storage":
      return {
        emoji: "💾",
        tooltip: "Amount of space available for storing files and applications."
      };
    case "graphics":
      return {
        emoji: "🎮",
        tooltip: "Graphics processing capability, important for gaming and graphics-intensive tasks."
      };
    case "screen size":
      return {
        emoji: "📏",
        tooltip: "Diagonal measurement of the display screen in inches."
      };
    case "screen resolution":
      return {
        emoji: "🔍",
        tooltip: "Number of pixels displayed on screen. Higher resolution means sharper, more detailed images."
      };
    case "weight":
      return {
        emoji: "⚖️",
        tooltip: "Physical weight of the laptop. Lower weight means better portability."
      };
    case "battery life":
      return {
        emoji: "🔋",
        tooltip: "How long the laptop can run on battery power. Longer is better for portable use."
      };
    case "refresh rate":
      return {
        emoji: "🔄",
        tooltip: "Number of times per second that the display refreshes. Higher refresh rates result in smoother motion, important for gaming and video editing."
      };
    case "ports":
      return {
        emoji: "🔌",
        tooltip: "Available connection ports such as USB, HDMI, Thunderbolt, etc. More variety and quantity typically offer better connectivity options."
      };
    case "os":
      return {
        emoji: "💻",
        tooltip: "Operating system that comes pre-installed on the laptop."
      };
    case "release year":
      return {
        emoji: "📅",
        tooltip: "The year when this laptop model was released. Newer releases typically have more modern technology."
      };
    default:
      return { emoji: "", tooltip: "" };
  }
};
