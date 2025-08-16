import { useCallback, useState } from 'react';

export type ViewMode = 'camera' | 'backend';

export interface DisplayState {
  viewMode: ViewMode;
  showOverlay: boolean;
  processedFrame: string | null;
  frameTimestamp: number;
}

export const useDisplayManager = () => {
  const [displayState, setDisplayState] = useState<DisplayState>({
    viewMode: 'camera',
    showOverlay: true,
    processedFrame: null,
    frameTimestamp: 0
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setDisplayState(prev => ({
      ...prev,
      viewMode: mode,
      // Clear processed frame when switching to camera mode
      processedFrame: mode === 'camera' ? null : prev.processedFrame
    }));
  }, []);

  const toggleOverlay = useCallback(() => {
    setDisplayState(prev => ({
      ...prev,
      showOverlay: !prev.showOverlay
    }));
  }, []);

  const updateProcessedFrame = useCallback((frameData: string) => {
    const timestamp = Date.now();
    setDisplayState(prev => ({
      ...prev,
      processedFrame: `data:image/jpeg;base64,${frameData}?t=${timestamp}`,
      frameTimestamp: timestamp
    }));
  }, []);

  const clearProcessedFrame = useCallback(() => {
    setDisplayState(prev => ({
      ...prev,
      processedFrame: null,
      frameTimestamp: 0
    }));
  }, []);

  return {
    displayState,
    setViewMode,
    toggleOverlay,
    updateProcessedFrame,
    clearProcessedFrame
  };
};
