
export interface CacheOptions {
  expiry?: number; // Time in milliseconds
  prefix?: string;
}

// Simple client-side cache implementation
export class ClientCache {
  private prefix: string;
  
  constructor(options: CacheOptions = {}) {
    this.prefix = options.prefix || 'app-cache-';
  }
  
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  get<T>(key: string): T | null {
    try {
      const cachedItem = localStorage.getItem(this.getKey(key));
      
      if (!cachedItem) return null;
      
      const { value, expiry } = JSON.parse(cachedItem);
      
      // Check if cache has expired
      if (expiry && Date.now() > expiry) {
        this.remove(key);
        return null;
      }
      
      return value as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    try {
      const expiry = options.expiry ? Date.now() + options.expiry : null;
      
      localStorage.setItem(
        this.getKey(key), 
        JSON.stringify({ value, expiry })
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }
  
  clear(startsWith?: string): void {
    if (startsWith) {
      // Clear only keys that start with the provided prefix
      const fullPrefix = this.getKey(startsWith);
      
      Object.keys(localStorage)
        .filter(key => key.startsWith(fullPrefix))
        .forEach(key => localStorage.removeItem(key));
    } else {
      // Clear all keys with this cache's prefix
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  }
}

// Create a default instance
export const cache = new ClientCache();

// Cache-aware fetch wrapper
export async function cachedFetch<T>(
  url: string, 
  options: RequestInit = {}, 
  cacheOptions: CacheOptions & { enabled?: boolean } = {}
): Promise<T> {
  const { enabled = true, expiry = 5 * 60 * 1000, prefix } = cacheOptions; // Default 5 minutes
  
  // Generate cache key from URL and request body
  const cacheKey = `fetch-${url}-${JSON.stringify(options.body || '')}`;
  
  // Use specific cache instance if prefix provided
  const cacheInstance = prefix ? new ClientCache({ prefix }) : cache;
  
  // Try to get from cache first
  if (enabled) {
    const cached = cacheInstance.get<T>(cacheKey);
    if (cached) return cached;
  }
  
  // If not in cache or cache disabled, fetch from network
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Save to cache if caching is enabled
  if (enabled) {
    cacheInstance.set(cacheKey, data, { expiry });
  }
  
  return data as T;
}
