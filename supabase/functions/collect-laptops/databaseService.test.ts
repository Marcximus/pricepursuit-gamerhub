
import { assertEquals, assertSpyCalls, spy } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { upsertProduct } from "./databaseService.ts";

// Mock SupabaseClient
class MockSupabaseClient {
  async from(table: string) {
    return {
      upsert: async (data: any) => {
        if (data[0].asin === "error") {
          return { error: new Error("Database error") };
        }
        return { error: null };
      }
    };
  }
}

Deno.test({
  name: "upsertProduct successfully inserts data",
  async fn() {
    const mockData = {
      asin: "B01234567",
      title: "Test Laptop",
      price: 999.99,
      price_strikethrough: 1099.99,
      rating: 4.5,
      reviews_count: 100,
      url_image: "http://example.com/image.jpg",
      url: "http://example.com/product",
      manufacturer: "Test Brand"
    };

    const mockProcessedData = {
      asin: "B01234567",
      processor: "Intel i7",
      ram: "16GB",
      storage: "512GB",
      screen_size: "15.6 inches",
      screen_resolution: "1920x1080",
      graphics: "NVIDIA RTX 3060",
      weight: "2.1 kg",
      battery_life: "8 hours",
      brand: "Test Brand",
      model: "Test Model"
    };

    const mockSupabase = new MockSupabaseClient();
    const consoleSpy = spy(console, "log");

    try {
      await upsertProduct(mockSupabase as any, mockData, mockProcessedData);
      assertSpyCalls(consoleSpy, 2); // Should log start and success messages
    } finally {
      consoleSpy.restore();
    }
  }
});

Deno.test({
  name: "upsertProduct handles database error",
  async fn() {
    const mockData = {
      asin: "error", // This will trigger our mock error
      title: "Test Laptop"
    };

    const mockProcessedData = {
      asin: "error",
      processor: null,
      ram: null,
      storage: null,
      screen_size: null,
      screen_resolution: null,
      graphics: null,
      weight: null,
      battery_life: null,
      brand: null,
      model: null
    };

    const mockSupabase = new MockSupabaseClient();

    await assertRejects(
      async () => {
        await upsertProduct(mockSupabase as any, mockData, mockProcessedData);
      },
      Error,
      "Database error"
    );
  }
});
