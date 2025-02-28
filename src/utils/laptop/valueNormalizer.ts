
// Re-export all normalizers from the new module structure
export {
  normalizeBrand
} from './normalizer/brandNormalizer';

export {
  normalizeProcessor,
  normalizeGraphics
} from './normalizer/hardwareNormalizer';

export {
  normalizeScreenSize
} from './normalizer/screenNormalizer';

export {
  normalizeRam,
  normalizeStorage
} from './normalizer/storageNormalizer';
