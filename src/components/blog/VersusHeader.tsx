
import { cn } from "@/lib/utils";

interface VersusHeaderProps {
  product1: {
    name: string;
    image?: string;
  };
  product2: {
    name: string;
    image?: string;
  };
  className?: string;
}

export const VersusHeader = ({ product1, product2, className }: VersusHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between my-8", className)}>
      <div className="text-center w-[45%]">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
          {product1.image ? (
            <img 
              src={product1.image} 
              alt={product1.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No image available
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold line-clamp-2">{product1.name}</h3>
      </div>
      
      <div className="flex-shrink-0 relative">
        <div className="bg-red-600 text-white font-bold text-2xl w-16 h-16 rounded-full flex items-center justify-center transform rotate-3 shadow-lg border-2 border-white">
          VS
        </div>
      </div>
      
      <div className="text-center w-[45%]">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
          {product2.image ? (
            <img 
              src={product2.image} 
              alt={product2.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No image available
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold line-clamp-2">{product2.name}</h3>
      </div>
    </div>
  );
};

export default VersusHeader;
