
import { useState } from 'react';

export interface UpdateStateResult {
  isUpdating: boolean;
  updateSuccess: boolean;
  updateStartTime: Date | null;
  showLongUpdateMessage: boolean;
  longUpdateWarningTimeout: NodeJS.Timeout | null;
  maxUpdateWarningTimeout: NodeJS.Timeout | null;
  setIsUpdating: (isUpdating: boolean) => void;
  setUpdateSuccess: (success: boolean) => void;
  setUpdateStartTime: (time: Date | null) => void;
  setShowLongUpdateMessage: (show: boolean) => void;
  setLongUpdateWarningTimeout: (timeout: NodeJS.Timeout | null) => void;
  setMaxUpdateWarningTimeout: (timeout: NodeJS.Timeout | null) => void;
  resetState: () => void;
}

export const useUpdateState = (): UpdateStateResult => {
  // State for update tracking
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateStartTime, setUpdateStartTime] = useState<Date | null>(null);
  const [showLongUpdateMessage, setShowLongUpdateMessage] = useState(false);
  const [longUpdateWarningTimeout, setLongUpdateWarningTimeout] = useState<NodeJS.Timeout | null>(null);
  const [maxUpdateWarningTimeout, setMaxUpdateWarningTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to reset all state
  const resetState = () => {
    setIsUpdating(false);
    setUpdateSuccess(false);
    setUpdateStartTime(null);
    setShowLongUpdateMessage(false);
    setLongUpdateWarningTimeout(null);
    setMaxUpdateWarningTimeout(null);
  };

  return {
    isUpdating,
    updateSuccess,
    updateStartTime,
    showLongUpdateMessage,
    longUpdateWarningTimeout,
    maxUpdateWarningTimeout,
    setIsUpdating,
    setUpdateSuccess,
    setUpdateStartTime,
    setShowLongUpdateMessage,
    setLongUpdateWarningTimeout,
    setMaxUpdateWarningTimeout,
    resetState
  };
};
