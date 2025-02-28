
export interface StatsCountResult {
  count: number;
  error: any | null;
}

export interface DatabaseStats {
  totalLaptops: number;
  updateStatus: {
    notUpdated: StatsCountResult;
    notChecked: StatsCountResult;
    recentlyChecked: StatsCountResult;
  };
  aiStatus: {
    pending: StatsCountResult;
    processed: StatsCountResult;
    inProgress: StatsCountResult;
    error: StatsCountResult;
  };
  missingInfo: {
    noProcessor: StatsCountResult;
    noRam: StatsCountResult;
    noStorage: StatsCountResult;
    noGraphics: StatsCountResult;
    missingAnySpec: StatsCountResult;
  };
  percentages: {
    pendingAi: number;
    processedAi: number;
    missingSpecs: number;
    recentlyChecked: number;
  };
  // These properties are used by the components
  aiProcessingStatus: {
    pending: StatsCountResult;
    processing: StatsCountResult;
    error: StatsCountResult;
    complete: StatsCountResult;
    completionPercentage: number;
  };
  missingInformation: {
    prices: { percentage: number };
    processor: { percentage: number };
    ram: { percentage: number };
    storage: { percentage: number };
    graphics: { percentage: number };
    screenSize: { percentage: number };
  };
}
