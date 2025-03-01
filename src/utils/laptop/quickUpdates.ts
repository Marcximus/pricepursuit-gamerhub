
import { updateB07QQB7552Storage } from "./manualProductUpdates";

// Function that can be called from browser console
export const updateLaptopB07QQB7552 = async () => {
  console.log("Updating laptop B07QQB7552 storage to 256GB SSD...");
  const result = await updateB07QQB7552Storage();
  
  if (result.success) {
    console.log("✅ Update successful:", result.data);
    return "Storage updated to 256GB SSD";
  } else {
    console.error("❌ Update failed:", result.error);
    return "Failed to update storage";
  }
};

// Make the function globally accessible in browser console
if (typeof window !== 'undefined') {
  (window as any).updateLaptopB07QQB7552 = updateLaptopB07QQB7552;
}
