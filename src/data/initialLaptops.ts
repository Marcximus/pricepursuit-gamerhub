
import type { Product } from "@/types/product";

// Initial dataset that will be shown immediately
export const initialLaptops: Product[] = [
  {
    id: "1",
    asin: "B0BS47YVDF",
    title: "Apple 2023 MacBook Pro Laptop M2 Pro",
    current_price: 2499,
    original_price: 2699,
    rating: 4.8,
    rating_count: 1250,
    image_url: "https://m.media-amazon.com/images/I/61fd2oCrvyL._AC_SL1500_.jpg",
    product_url: "https://www.amazon.com/dp/B0BS47YVDF",
    last_checked: new Date().toISOString(),
    created_at: new Date().toISOString(),
    processor: "Apple M2 Pro",
    processor_score: 95,
    ram: "16GB",
    storage: "512GB SSD",
    graphics: "16-core GPU",
    screen_size: "14.2 inch",
    brand: "Apple",
    total_reviews: 1250,
    average_rating: 4.8
  },
  {
    id: "2",
    asin: "B0BSK58BDH",
    title: "Lenovo Legion Pro 7i Gaming Laptop",
    current_price: 1999,
    original_price: 2299,
    rating: 4.6,
    rating_count: 850,
    image_url: "https://m.media-amazon.com/images/I/71RoVxwGjnL._AC_SL1500_.jpg",
    product_url: "https://www.amazon.com/dp/B0BSK58BDH",
    last_checked: new Date().toISOString(),
    created_at: new Date().toISOString(),
    processor: "Intel Core i9-13900HX",
    processor_score: 92,
    ram: "32GB",
    storage: "1TB SSD",
    graphics: "NVIDIA RTX 4080",
    screen_size: "16 inch",
    brand: "Lenovo",
    total_reviews: 850,
    average_rating: 4.6
  },
  // Add a few more static entries to ensure a good initial display
  {
    id: "3",
    asin: "B0B7MVGWK1",
    title: "ASUS ROG Strix G15 Gaming Laptop",
    current_price: 1499,
    original_price: 1699,
    rating: 4.7,
    rating_count: 980,
    image_url: "https://m.media-amazon.com/images/I/71RoVxwGjnL._AC_SL1500_.jpg",
    product_url: "https://www.amazon.com/dp/B0B7MVGWK1",
    last_checked: new Date().toISOString(),
    created_at: new Date().toISOString(),
    processor: "AMD Ryzen 9 6900HX",
    processor_score: 88,
    ram: "16GB",
    storage: "1TB SSD",
    graphics: "NVIDIA RTX 3070",
    screen_size: "15.6 inch",
    brand: "ASUS",
    total_reviews: 980,
    average_rating: 4.7
  }
];

