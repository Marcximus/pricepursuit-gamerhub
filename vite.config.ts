
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { supabase } from "./src/integrations/supabase/client";
import type { Connect, IncomingMessage, ServerResponse } from 'http';
import type { ProxyOptions } from 'vite';

// Function to fetch data at build time
async function fetchBuildTimeData() {
  console.log('Fetching build time data...');
  const { data: laptops, error } = await supabase
    .from('products')
    .select(`
      *,
      product_reviews (*)
    `)
    .eq('is_laptop', true)
    .order('rating', { ascending: false })
    .limit(20); // Limit to 20 most relevant laptops for initial load

  if (error) {
    console.error('Error fetching build time data:', error);
    return [];
  }

  return laptops;
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://kkebyebrhdpcwqnxhjcx.supabase.co',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
        configure: (proxy: ProxyOptions) => {
          // Add basic memory cache
          const cache = new Map<string, string>();
          
          proxy.on('proxyReq', (proxyReq: Connect.ProxyRequest, req: IncomingMessage) => {
            const key = req.url;
            if (key && cache.has(key)) {
              console.log('Cache hit:', key);
              return cache.get(key);
            }
          });

          proxy.on('proxyRes', (proxyRes: Connect.ProxyResponse, req: IncomingMessage) => {
            const key = req.url;
            let body = '';
            proxyRes.on('data', (chunk: Buffer) => body += chunk);
            proxyRes.on('end', () => {
              if (key) {
                cache.set(key, body);
                // Cache for 5 minutes
                setTimeout(() => cache.delete(key), 5 * 60 * 1000);
              }
            });
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __INITIAL_DATA__: mode === 'production' ? 
      JSON.stringify(await fetchBuildTimeData()) : 
      JSON.stringify([])
  }
}));
