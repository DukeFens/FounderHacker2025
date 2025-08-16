import React from 'react';
import { ViewMode } from '@/hooks/useDisplayManager';

interface ViewControlsProps {
  viewMode: ViewMode;
  showOverlay: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleOverlay: () => void;
  disabled?: boolean;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  viewMode,
  showOverlay,
  onViewModeChange,
  onToggleOverlay,
  disabled = false
}) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex gap-2">
      {/* View Mode Toggle */}
      <button
        onClick={() => onViewModeChange(viewMode === 'camera' ? 'backend' : 'camera')}
        disabled={disabled}
        className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {viewMode === 'camera' ? '🤖 Backend Skeleton' : '📷 Raw Camera'}
      </button>

      {/* Overlay Toggle - only show for camera mode */}
      {viewMode === 'camera' && (
        <button
          onClick={onToggleOverlay}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            showOverlay 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      )}
    </div>
  );
};
