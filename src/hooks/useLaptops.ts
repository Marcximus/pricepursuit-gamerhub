
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";

export { collectLaptops, updateLaptops, refreshBrandModels };

export const ITEMS_PER_PAGE = 50;

export const useLaptops = (page: number = 1, sortBy: SortOption = 'rating-desc') => {
  const query = useQuery({
    queryKey: ['laptops', page, sortBy],
    queryFn: async () => {
      try {
        console.log('Fetching laptops from Supabase for page:', page, 'with sort:', sortBy);
        
        // First get a count of all laptop products
        const { count: totalCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_laptop', true);

        if (countError) {
          console.error('Error getting laptop count:', countError);
          throw countError;
        }

        console.log(`Total laptop count in database: ${totalCount}`);

        // Calculate pagination range
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        // Build the base query
        let query = supabase
          .from('products')
          .select(`
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
          `)
          .eq('is_laptop', true);

        // Apply sorting based on the sortBy parameter
        switch (sortBy) {
          case 'price-asc':
            query = query
              .order('current_price', { ascending: true, nullsFirst: false })
              .order('id', { ascending: true }); // Secondary sort for stability
            break;
          case 'price-desc':
            query = query
              .order('current_price', { ascending: false, nullsFirst: false })
              .order('id', { ascending: true }); // Secondary sort for stability
            break;
          case 'rating-desc':
            query = query
              .order('wilson_score', { ascending: false, nullsFirst: false })
              .order('current_price', { ascending: true, nullsFirst: true });
            break;
        }

        // Apply pagination last
        query = query.range(start, end);

        // Execute the query
        const { data: laptops, error } = await query;

        if (error) {
          console.error('Error fetching laptops:', error);
          throw error;
        }

        if (!laptops || laptops.length === 0) {
          console.log('No laptops found for current page');
          return { 
            laptops: [], 
            totalCount: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
          };
        }

        // Log the raw data to verify brand values
        console.log('Raw laptops data:', laptops.map(l => ({ id: l.id, brand: l.brand })));

        // Process and return the laptops
        const processedLaptops = laptops.map(laptop => {
          const reviews = laptop.product_reviews || [];
          
          const reviewData = {
            rating_breakdown: {},
            recent_reviews: reviews.map(review => ({
              rating: review.rating,
              title: review.title || '',
              content: review.content || '',
              reviewer_name: review.reviewer_name || 'Anonymous',
              review_date: review.review_date,
              verified_purchase: review.verified_purchase || false,
              helpful_votes: review.helpful_votes || 0
            }))
          };

          // Calculate average rating if needed
          let avgRating = laptop.rating;
          if (!avgRating && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            avgRating = totalRating / reviews.length;
          }

          // Return a complete laptop object that matches the Product type
          return {
            ...laptop,
            brand: laptop.brand || 'Unknown', // Ensure brand is never null/undefined
            product_url: laptop.product_url || null,
            last_checked: laptop.last_checked || null,
            created_at: laptop.created_at || null,
            average_rating: avgRating,
            total_reviews: reviews.length,
            review_data: reviewData
          };
        });

        const finalLaptops = processedLaptops.map(laptop => processLaptopData(laptop as unknown as Product));
        
        // Log processed laptops brands
        console.log('Processed laptops brands:', finalLaptops.map(l => l.brand));

        return {
          laptops: finalLaptops,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};
