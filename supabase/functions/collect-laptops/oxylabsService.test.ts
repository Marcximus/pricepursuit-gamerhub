
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { fetchLaptopData } from "./oxylabsService.ts";

Deno.test({
  name: "fetchLaptopData constructs correct payload and returns data",
  async fn() {
    // Mock the global fetch
    const originalFetch = globalThis.fetch;
    const mockResponse = {
      results: [{
        content: {
          results: {
            organic: [{
              asin: "B01234567",
              title: "Test Laptop",
              price: 999.99,
              price_strikethrough: 1099.99,
              rating: 4.5,
              reviews_count: 100,
              url_image: "http://example.com/image.jpg",
              url: "http://example.com/product",
              manufacturer: "Test Brand"
            }]
          }
        }
      }]
    };

    try {
      globalThis.fetch = async (url: string, init?: RequestInit) => {
        // Verify the request is properly formatted
        const body = JSON.parse(init?.body as string);
        assertEquals(body.source, "amazon_search");
        assertEquals(body.domain, "com");
        assertEquals(typeof body.query, "string");
        assertEquals(body.pages, 1);
        assertEquals(body.parse, true);

        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      };

      const result = await fetchLaptopData("TestBrand", 1);
      assertEquals(result, mockResponse);
    } finally {
      // Restore original fetch
      globalThis.fetch = originalFetch;
    }
  }
});

Deno.test({
  name: "fetchLaptopData handles API error",
  async fn() {
    const originalFetch = globalThis.fetch;
    
    try {
      globalThis.fetch = async () => {
        return new Response("Error", { status: 500 });
      };

      await assertRejects(
        async () => {
          await fetchLaptopData("TestBrand", 1);
        },
        Error,
        "[Oxylabs] API error: 500"
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
});
