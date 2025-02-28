
export interface CollectionStats {
  processed: number;
  updated: number;
  added: number;
  failed: number;
  skipped?: number;
}

export interface CollectionConfig {
  LAPTOP_BRANDS: string[];
  PARALLEL_BATCHES: number;
  DELAY_BETWEEN_BATCHES: number;
  PAGES_PER_BRAND: number;
  STALE_COLLECTION_MINUTES: number;
}

// Define the MatchResult type for pattern matching
export interface MatchResult {
  matched: boolean;
  value?: string;
}

// Define the structure of the progress data stored in the database
export interface CollectionProgressData {
  groupIndex: number;
  brandIndex: number;
  timestamp: string;
  stats: CollectionStats;
}
