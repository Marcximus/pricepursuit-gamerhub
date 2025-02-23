
import { LaptopList } from "@/components/laptops/LaptopList";
import { useAllProducts } from "@/hooks/useLaptops";
import Navigation from "@/components/Navigation";

const Products = () => {
  const { 
    data, 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useAllProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <LaptopList
            laptops={data.laptops}
            totalCount={data.totalCount}
            currentPage={1}
            totalPages={data.totalPages}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            isRefetching={isRefetching}
            onPageChange={() => {}}
          />
        </div>
      </main>
    </div>
  );
};

export default Products;

