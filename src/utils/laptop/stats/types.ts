
export interface StatsCountResult {
  count: number;
  error: Error | null;
}

export interface DatabaseStats {
  totalLaptops: number;
  updateStatus: {
    notUpdated: { count: number; percentage: number };
    notChecked: { count: number; percentage: number };
    pendingUpdate: { count: number; percentage: number };
    inProgress: { count: number; percentage: number };
    completed: { count: number; percentage: number };
    error: { count: number; percentage: number };
    updatedLast24h: { count: number; percentage: number };
    updatedLast7d: { count: number; percentage: number };
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
    images: { count: number; percentage: number };
  };
}
