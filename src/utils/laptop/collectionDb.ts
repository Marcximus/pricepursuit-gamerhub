
// Re-export all collection-related functionality from the new modular structure
export {
  resetStaleCollections,
  checkActiveCollections,
  updateBrandStatus
} from './collection/statusManagement';

export {
  processPage
} from './collection/dataProcessing';

export {
  saveCollectionProgress,
  getLastCollectionProgress
} from './collection/progressTracking';
