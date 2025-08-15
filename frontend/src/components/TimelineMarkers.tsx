'use client';

import React from 'react';
import { RepMetric } from '@/types';
import { Clock, Flag, Target } from 'lucide-react';

interface TimelineMarkersProps {
  repMetrics: RepMetric[];
  currentTime: number;
  onTimeSelect: (time: number) => void;
}

export const TimelineMarkers: React.FC<TimelineMarkersProps> = ({
  repMetrics,
  currentTime,
  onTimeSelect
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMarkerColor = (metric: RepMetric) => {
    if (metric.score >= 90) return 'bg-green-500';
    if (metric.score >= 80) return 'bg-blue-500';
    if (metric.score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMarkerIcon = (metric: RepMetric) => {
    if (metric.flags.length === 0) return <Target className="w-3 h-3 text-white" />;
    return <Flag className="w-3 h-3 text-white" />;
  };

  const getMarkerTooltip = (metric: RepMetric) => {
    const time = formatTime(metric.tStart);
    const score = metric.score;
    const flags = metric.flags.length > 0 ? metric.flags.join(', ') : 'No issues';
    
    return `Rep ${metric.repIndex} at ${time}\nScore: ${score}%\nIssues: ${flags}`;
  };

  if (repMetrics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No rep data available</p>
      </div>
    );
  }

  // Calculate timeline duration
  const maxTime = Math.max(...repMetrics.map(m => m.tEnd));
  const timelineDuration = maxTime;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Timeline Markers</h4>
      
      {/* Timeline Bar */}
      <div className="relative">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Current time indicator */}
          <div 
            className="absolute top-0 h-3 w-1 bg-blue-600 rounded-full z-10"
            style={{ 
              left: `${(currentTime / timelineDuration) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          />
          
          {/* Rep markers */}
          {repMetrics.map((metric, index) => {
            const position = (metric.tStart / timelineDuration) * 100;
            const isCurrent = Math.abs(currentTime - metric.tStart) < 1000; // Within 1 second
            
            return (
              <div
                key={index}
                className={`absolute top-0 w-4 h-4 rounded-full cursor-pointer transition-all duration-200 hover:scale-125 ${
                  getMarkerColor(metric)
                } ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                style={{ 
                  left: `${position}%`,
                  transform: 'translateX(-50%)'
                }}
                onClick={() => onTimeSelect(metric.tStart)}
                title={getMarkerTooltip(metric)}
              >
                {getMarkerIcon(metric)}
              </div>
            );
          })}
        </div>
        
        {/* Time labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0:00</span>
          <span>{formatTime(timelineDuration)}</span>
        </div>
      </div>

      {/* Rep List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {repMetrics.map((metric, index) => {
          const isCurrent = Math.abs(currentTime - metric.tStart) < 1000;
          
          return (
            <div
              key={index}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                isCurrent 
                  ? 'bg-blue-50 border-2 border-blue-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onTimeSelect(metric.tStart)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getMarkerColor(metric)}`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      Rep {metric.repIndex}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(metric.tStart)} - {formatTime(metric.tEnd)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${
                    metric.score >= 90 ? 'text-green-600' :
                    metric.score >= 80 ? 'text-blue-600' :
                    metric.score >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {metric.score}%
                  </div>
                  {metric.flags.length > 0 && (
                    <div className="text-xs text-red-600">
                      {metric.flags.length} issue{metric.flags.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Flags preview */}
              {metric.flags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {metric.flags.slice(0, 2).map((flag, flagIndex) => (
                    <span
                      key={flagIndex}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                    >
                      {flag}
                    </span>
                  ))}
                  {metric.flags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{metric.flags.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
