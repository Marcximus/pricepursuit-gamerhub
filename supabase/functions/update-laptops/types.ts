
export interface OxylabsResponse {
  results: Array<{
    content: {
      title: string;
      price: string | null;
      ratings: string;
      reviews: string;
      brand: string;
      model_name: string;
      screen_size: string;
      cpu_model: string;
      ram_memory_installed_size: string;
      hard_disk_size: string;
      graphics_card_description: string;
      graphics_coprocessor: string;
      operating_system: string;
    };
  }>;
}

