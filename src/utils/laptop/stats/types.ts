
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
}
