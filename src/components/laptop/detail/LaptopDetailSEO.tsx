import { Helmet } from 'react-helmet-async';
import type { Product } from '@/types/product';

interface LaptopDetailSEOProps {
  product: Product;
}

export function LaptopDetailSEO({ product }: LaptopDetailSEOProps) {
  const url = `${window.location.origin}/laptop/${product.asin}`;
  const title = `${product.title} - Specs, Price & Reviews | Laptop Hunter`;
  const description = `${product.title} - ${product.processor || 'Premium processor'}, ${product.ram || '8GB RAM'}, ${product.storage || '256GB storage'}. Current price: $${product.current_price}. ${product.rating}/5 stars (${product.rating_count} reviews). Compare prices and specs.`;
  
  const keywords = [
    product.brand,
    product.model,
    product.processor,
    'laptop',
    'review',
    'price',
    'specs',
    product.graphics ? 'gaming laptop' : '',
  ].filter(Boolean).join(', ');

  // Product Schema.org structured data
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.image_url,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "USD",
      "price": product.current_price,
      "availability": product.current_price > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    "aggregateRating": product.rating && product.rating_count ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.rating_count,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Laptops",
        "item": `${window.location.origin}/`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.brand,
        "item": `${window.location.origin}/?brand=${product.brand}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.title,
        "item": url
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={product.image_url} />
      <meta property="product:price:amount" content={product.current_price.toString()} />
      <meta property="product:price:currency" content="USD" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={product.image_url} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}
