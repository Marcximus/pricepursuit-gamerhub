
export type FilterOptions = {
  priceRange: { min: number; max: number };
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
  brands: Set<string>;
};

export type FilterSection = {
  id: string;
  hasActiveFilters: boolean;
};

export type DisabledOptions = {
  brands: Set<string>;
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
};

export type FilterCategoryKey = keyof Omit<FilterOptions, 'priceRange'>;
