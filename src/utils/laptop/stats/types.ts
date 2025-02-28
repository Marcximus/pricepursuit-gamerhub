
export interface StatsCountResult {
  count: number;
  error: Error | null;
}

export interface DatabaseStats {
  totalLaptops: number;
  updateStatus: {
    notUpdated: { count: number; percentage: number };
    notChecked: { count: number; percentage: number };
  };
  aiProcessingStatus: {
    pending: { count: number; percentage: number };
    processing: { count: number; percentage: number };
    error: { count: number; percentage: number };
    complete: { count: number; percentage: number };
    completionPercentage: number;
  };
  missingInformation: {
    prices: { count: number; percentage: number };
    processor: { count: number; percentage: number };
    ram: { count: number; percentage: number };
    storage: { count: number; percentage: number };
    graphics: { count: number; percentage: number };
    screenSize: { count: number; percentage: number };
  };
}
