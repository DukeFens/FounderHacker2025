import React from 'react';

interface ProcessedFrameViewProps {
  frameData: string | null;
  frameTimestamp: number;
  className?: string;
}

export const ProcessedFrameView: React.FC<ProcessedFrameViewProps> = ({
  frameData,
  frameTimestamp,
  className = "w-full h-full object-cover"
}) => {
  if (!frameData) {
    return (
      <div className="flex items-center justify-center h-96 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-lg font-medium">Backend MediaPipe Processing</p>
          <p className="text-sm text-gray-400 mt-2">Start camera to see pose skeleton</p>
        </div>
      </div>
    );
  }

  return (
    <img
      key={frameTimestamp} // Force re-render on frame updates
      src={frameData}
      alt="MediaPipe Processed Frame"
      className={className}
      style={{ imageRendering: 'pixelated' }} // Prevent image smoothing for better skeleton visibility
    />
  );
};
