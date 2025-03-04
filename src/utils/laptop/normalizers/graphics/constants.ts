
/**
 * Constants and patterns used for graphics card normalization
 */

// Common brand and GPU family patterns 
export const GRAPHICS_PATTERNS = {
  NVIDIA: {
    PREFIX: /\b(?:nvidia|geforce)\b/i,
    RTX_SERIES: /\brtx\s*(\d{4}(?:\s*ti|\s*super)?)\b/i,
    RTX_SERIES_SHORT: /\brtx\s*(\d{1,2})(\d{2})(?:\s*ti|\s*super)?\b/i,
    GTX_SERIES: /\bgtx\s*(\d{3,4}(?:\s*ti|\s*super)?)\b/i,
    MAX_Q: /\bmax-?q\b/i,
    MX_SERIES: /\bmx\s*(\d{3}(?:\s*ti)?)\b/i
  },
  AMD: {
    PREFIX: /\b(?:amd|radeon)\b/i,
    RX_SERIES: /\bradeon\s*(?:rx\s*)?(\d{3,4}(?:\s*xt)?)\b/i,
    VEGA_SERIES: /\bvega\s*(\d*)\b/i
  },
  INTEL: {
    PREFIX: /\bintel\b/i,
    ARC_SERIES: /\barc\s*([a-z]\d{2,3})\b/i,
    IRIS_XE: /\biris\s*xe\b/i,
    IRIS: /\biris\b/i,
    UHD: /\buhd\b/i,
    HD: /\bhd\s*graphics\b/i
  },
  APPLE: {
    PREFIX: /\b(?:apple|m[123])\b/i,
    M_SERIES: /\bm([123])(?:\s*(pro|max|ultra))?\b/i
  }
};

// Invalid or too generic values to be rejected
export const INVALID_GRAPHICS = [
  /^integrated$/i,
  /^dedicated$/i,
  /^gpu$/i,
  /^graphics$/i,
  /^graphics\s+card$/i,
  /^video\s+card$/i,
  /^32-core$/i,
  /^undefined$/i,
  /^n\/a$/i
];

// Brand names that shouldn't be used as standalone GPU identifiers
export const STANDALONE_BRANDS = [
  /^apple$/i,
  /^asus$/i,
  /^dell$/i,
  /^hp$/i,
  /^lenovo$/i,
  /^msi$/i,
  /^acer$/i,
  /^samsung$/i,
  /^microsoft$/i,
  /^toshiba$/i,
  /^lg$/i,
  /^huawei$/i,
  /^razer$/i,
  /^alienware$/i
];
