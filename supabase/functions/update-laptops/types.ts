
// Request Types
export interface LaptopUpdateRequest {
  laptops: Array<{
    id: string;
    asin: string;
    current_price?: number;
    title?: string;
    last_checked?: string;
  }>;
}

// Response Types
export interface UpdateResponse {
  success: boolean;
  message: string;
  updatedCount: number;
  failedCount: number;
  results: {
    updated: Array<{
      id: string;
      asin: string;
      success: boolean;
      message?: string;
    }>;
    failed: Array<{
      id: string;
      asin: string;
      error: string;
    }>;
  };
}
