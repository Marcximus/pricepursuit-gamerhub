
import type { Product } from "@/types/product";

// Create an affiliate URL for the product
export const getAffiliateUrl = (product: Product | null): string => {
  if (!product || !product.asin) return '#';
  return `https://www.amazon.com/dp/${product.asin}?tag=with-laptop-discount-20`;
};
