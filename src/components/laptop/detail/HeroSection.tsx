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
    <div className="grid md:grid-cols-2 gap-8 mb-12 items-start">
      {/* Image Section */}
      <div className="relative">
        <div className="sticky top-8">
          <div className="bg-card rounded-lg overflow-hidden border border-border shadow-lg">
            <Image
              src={product.image_url}
              alt={product.title}
              width={600}
              height={600}
              className="w-full h-auto"
            />
          </div>
          {discount > 0 && (
            <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-4 py-2">
              <TrendingDown className="w-4 h-4 mr-1" />
              {discount}% OFF
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="space-y-6 pt-0">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight line-clamp-2">
          {product.title}
        </h1>

        {/* Brand & Model */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            {product.brand}
          </Badge>
          {product.model && (
            <Badge variant="outline" className="text-sm">
              Model: {product.model}
            </Badge>
          )}
        </div>

        {/* Rating */}
        {product.rating && product.rating_count && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-foreground">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              ({product.rating_count.toLocaleString()} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="bg-muted rounded-lg p-6 space-y-2">
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-foreground">
              ${Math.round(product.current_price).toLocaleString()}
            </span>
            {product.original_price && product.current_price < product.original_price && (
              <span className="text-xl text-muted-foreground line-through">
                ${Math.round(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Price last updated: {new Date(product.last_checked).toLocaleDateString()}
          </p>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 gap-4">
          {product.processor && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Processor</p>
              <p className="font-semibold text-foreground">{product.processor}</p>
            </div>
          )}
          {product.ram && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">RAM</p>
              <p className="font-semibold text-foreground">{product.ram}</p>
            </div>
          )}
          {product.storage && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Storage</p>
              <p className="font-semibold text-foreground">{product.storage}</p>
            </div>
          )}
          {product.screen_size && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Screen</p>
              <p className="font-semibold text-foreground">{product.screen_size}</p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full text-lg h-14"
          asChild
        >
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Check It Out
            <ExternalLink className="w-5 h-5 ml-2" />
          </a>
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          *As an Amazon Associate, we earn from qualifying purchases
        </p>
      </div>
    </div>
  );
}
