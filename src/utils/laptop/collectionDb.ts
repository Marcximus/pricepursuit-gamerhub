
// Re-export all collection-related functionality from the new modular structure
export {
  resetStaleCollections,
  checkActiveCollections,
  updateBrandStatus,
  processPage,
  shouldCollectProductByTitle
} from './collection/status/pageProcessing';

export {
  processProductData
} from './collection/dataProcessing';

export {
  saveCollectionProgress,
  getLastCollectionProgress
} from './collection/statusManagement';
