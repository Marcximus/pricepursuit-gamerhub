
import type { Product } from "@/types/product";

export const paginateLaptops = (
  laptops: Product[],
  page: number,
  itemsPerPage: number
) => {
  const totalCount = laptops.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedLaptops = laptops.slice(start, end);

  return {
    laptops: paginatedLaptops,
    totalCount,
    totalPages
  };
};
