
import { supabase } from "@/integrations/supabase/client";

// Common columns for laptop queries
export const getLaptopColumns = (minimalForFilters = false) => {
  return minimalForFilters ? `
    id,
    processor,
    ram,
    storage,
    graphics,
    screen_size,
    brand,
    current_price
  ` : `
    id,
    title,
    current_price,
    original_price,
    rating,
    rating_count,
    image_url,
    processor,
    ram,
    storage,
    graphics,
    screen_size,
    screen_resolution,
    weight,
    processor_score,
    brand,
    model,
    asin,
    product_url,
    last_checked,
    created_at,
    wilson_score,
    product_reviews (
      id,
      rating,
      title,
      content,
      reviewer_name,
      review_date,
      verified_purchase,
      helpful_votes
    )
  `;
};

// Logging utility
export const logFetchProgress = (message: string, data?: any) => {
  console.log(message, data || '');
};
