
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { processWithDeepseek } from "./deepseekService.ts";

Deno.test({
  name: "processWithDeepseek extracts laptop specifications correctly",
  async fn() {
    const originalFetch = globalThis.fetch;
    const mockInput = {
      asin: "B01234567",
      title: "Dell XPS 13 Laptop 13.4 inch, Intel Core i7-1165G7, 16GB RAM, 512GB SSD",
      description: "High-performance laptop with stunning display"
    };

    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            asin: "B01234567",
            processor: "Intel Core i7-1165G7",
            ram: "16GB",
            storage: "512GB SSD",
            screen_size: "13.4 inches",
            screen_resolution: null,
            graphics: null,
            weight: null,
            battery_life: null,
            brand: "Dell",
            model: "XPS 13"
          })
        }
      }]
    };

    try {
      globalThis.fetch = async (url: string, init?: RequestInit) => {
        // Verify DeepSeek API request
        const body = JSON.parse(init?.body as string);
        assertEquals(body.model, "deepseek-chat");
        assertExists(body.messages);
        assertEquals(body.temperature, 0.1);

        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      };

      const result = await processWithDeepseek(mockInput);
      assertEquals(result.asin, mockInput.asin);
      assertEquals(result.processor, "Intel Core i7-1165G7");
      assertEquals(result.ram, "16GB");
      assertEquals(result.brand, "Dell");
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
});

Deno.test({
  name: "processWithDeepseek handles invalid JSON response",
  async fn() {
    const originalFetch = globalThis.fetch;
    
    try {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({
          choices: [{
            message: {
              content: "Invalid JSON"
            }
          }]
        }));
      };

      await assertRejects(
        async () => {
          await processWithDeepseek({
            asin: "test",
            title: "test",
            description: "test"
          });
        },
        Error,
        "Invalid JSON response from DeepSeek"
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
});
