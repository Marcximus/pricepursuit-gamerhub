import { ExternalLink, Star, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from '@/components/ui/image';
import type { Product } from '@/types/product';

interface HeroSectionProps {
  product: Product;
}

export function HeroSection({ product }: HeroSectionProps) {
  const affiliateUrl = `https://www.amazon.com/dp/${product.asin}?tag=with-laptop-discount-20`;
  const discount = product.original_price && product.current_price < product.original_price
    ? Math.round(((product.original_price - product.current_price) / product.original_price) * 100)
    : 0;

  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-8">
      {/* Image Section */}
      <div className="relative">
        <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
          <Image
            src={product.image_url}
            alt={product.title}
            width={600}
            height={600}
            className="w-full h-auto"
          />
          {discount > 0 && (
            <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-base px-3 py-1.5 shadow-lg">
              <TrendingDown className="w-4 h-4 mr-1" />
              {discount}% OFF
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="space-y-4 lg:space-y-5">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground flex items-center gap-2">
          <a href="/" className="hover:text-foreground transition-colors">Home</a>
          <span>/</span>
          <a href="/" className="hover:text-foreground transition-colors">Laptops</a>
          <span>/</span>
          <span className="text-foreground font-medium">{product.brand}</span>
        </nav>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
          {product.title}
        </h1>

        {/* Brand & Model */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {product.brand}
          </Badge>
          {product.model && (
            <Badge variant="outline" className="text-sm px-3 py-1">
              Model: {product.model}
            </Badge>
          )}
        </div>

        {/* Rating */}
        {product.rating && product.rating_count && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-bold text-foreground">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.rating_count.toLocaleString()} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="bg-muted/50 rounded-lg p-5 space-y-1.5 border border-border">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl lg:text-4xl font-bold text-green-600">
              ${Math.round(product.current_price).toLocaleString()}
            </span>
            {product.original_price && product.current_price < product.original_price && (
              <span className="text-lg text-muted-foreground line-through">
                ${Math.round(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(product.last_checked).toLocaleDateString()}
          </p>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 gap-3">
          {product.processor && (
            <div className="bg-card border border-border rounded-lg p-3.5 hover:border-primary/50 transition-colors">
              <p className="text-xs text-muted-foreground mb-1">Processor</p>
              <p className="font-semibold text-foreground text-sm">{product.processor}</p>
            </div>
          )}
          {product.ram && (
            <div className="bg-card border border-border rounded-lg p-3.5 hover:border-primary/50 transition-colors">
              <p className="text-xs text-muted-foreground mb-1">RAM</p>
              <p className="font-semibold text-foreground text-sm">{product.ram}</p>
            </div>
          )}
          {product.storage && (
            <div className="bg-card border border-border rounded-lg p-3.5 hover:border-primary/50 transition-colors">
              <p className="text-xs text-muted-foreground mb-1">Storage</p>
              <p className="font-semibold text-foreground text-sm">{product.storage}</p>
            </div>
          )}
          {product.screen_size && (
            <div className="bg-card border border-border rounded-lg p-3.5 hover:border-primary/50 transition-colors">
              <p className="text-xs text-muted-foreground mb-1">Screen</p>
              <p className="font-semibold text-foreground text-sm">{product.screen_size}</p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full text-base lg:text-lg h-12 lg:h-14 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
          asChild
        >
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Check It Out
            <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
          </a>
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          *As an Amazon Associate, we earn from qualifying purchases
        </p>
      </div>
    </div>
  );
}
