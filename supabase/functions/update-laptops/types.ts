
export interface UpdateLaptopRequest {
  asin: string;
  force?: boolean;
}

export interface UpdateLaptopResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface LaptopUpdateData {
  title?: string;
  description?: string;
  current_price?: number;
  original_price?: number;
  rating?: number;
  rating_count?: number;
  image_url?: string;
  review_data?: any;
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  screen_size?: string;
  screen_resolution?: string;
  weight?: string;
  battery_life?: string;
  update_status?: string;
  last_checked?: string;
  last_updated?: string;
}
