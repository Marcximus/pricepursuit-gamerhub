
export const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

export const COLLECTION_CONFIG = {
  LAPTOP_BRANDS,
  PARALLEL_BATCHES: 2,
  DELAY_BETWEEN_BATCHES: 5000,
  PAGES_PER_BRAND: 3,
  STALE_COLLECTION_MINUTES: 30
} as const;

export const AUTO_UPDATE_CONFIG = {
  INTERVAL_MINUTES: 5,
  INTERVAL_SECONDS: 5 * 60,
  CHECK_DELAY_MS: 1000
} as const;
