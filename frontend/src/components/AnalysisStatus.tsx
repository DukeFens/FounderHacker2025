import React from 'react';
import { PoseAnalysisResult } from '@/hooks/usePoseAnalysis';

interface AnalysisStatusProps {
  isAnalyzing: boolean;
  lastResult: PoseAnalysisResult | null;
  error: string | null;
  className?: string;
}

export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
  isAnalyzing,
  lastResult,
  error,
  className = "absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded"
}) => {
  if (error) {
    return (
      <div className={`${className} bg-red-500/70`}>
        ❌ Error: {error}
      </div>
    );
  }

  if (!isAnalyzing) {
    return (
      <div className={className}>
        ⏸️ Analysis paused
      </div>
    );
  }

  if (!lastResult) {
    return (
      <div className={className}>
        🔄 Initializing analysis...
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span>{lastResult.haspose ? '✅' : '❌'}</span>
        <span className="text-xs md:text-sm">
          {lastResult.haspose ? 'Pose Detected' : 'No Pose'} | 
          Reps: <span className="font-semibold text-green-300">{lastResult.reps}</span> | 
          Angle: <span className="font-semibold text-blue-300">{Math.round(lastResult.angle)}°</span> | 
          Stage: <span className="font-semibold text-yellow-300">{lastResult.stage}</span>
        </span>
      </div>
      {lastResult.feedback && (
        <div className="mt-1 text-xs text-green-200 bg-black/30 px-2 py-1 rounded">
          💬 {lastResult.feedback}
        </div>
      )}
    </div>
  );
};
