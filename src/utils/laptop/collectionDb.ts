
// Re-export all collection-related functionality from the new modular structure
export {
  resetStaleCollections,
  checkActiveCollections,
  updateBrandStatus
} from './collection/status/statusUpdates';

export {
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
