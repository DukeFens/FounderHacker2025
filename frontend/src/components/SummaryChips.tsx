'use client';

import React from 'react';
import { TrendingUp, Target, AlertTriangle } from 'lucide-react';

interface SummaryChipsProps {
  reps: number;
  avgScore: number;
  flags: string[];
}

export const SummaryChips: React.FC<SummaryChipsProps> = ({ reps, avgScore, flags }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🎯';
    if (score >= 80) return '👍';
    if (score >= 70) return '⚠️';
    return '❌';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
        Session Summary
      </h3>
      
      <div className="space-y-4">
        {/* Reps Counter */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Reps</div>
              <div className="text-2xl font-bold text-blue-600">{reps}</div>
            </div>
          </div>
          <div className="text-3xl">🏃‍♂️</div>
        </div>

        {/* Average Score */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                {avgScore}%
              </div>
            </div>
          </div>
          <div className="text-3xl">{getScoreIcon(avgScore)}</div>
        </div>

        {/* Form Issues */}
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Form Issues</div>
              <div className="text-2xl font-bold text-orange-600">{flags.length}</div>
            </div>
          </div>
          <div className="text-3xl">⚠️</div>
        </div>

        {/* Flags List */}
        {flags.length > 0 && (
          <div className="p-4 bg-red-50 rounded-2xl">
            <div className="text-sm font-medium text-red-800 mb-2">Current Issues:</div>
            <div className="space-y-1">
              {flags.slice(0, 3).map((flag, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {flag}
                </div>
              ))}
              {flags.length > 3 && (
                <div className="text-xs text-red-600 mt-1">
                  +{flags.length - 3} more issues
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Issues */}
        {flags.length === 0 && reps > 0 && (
          <div className="p-4 bg-green-50 rounded-2xl text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-sm font-medium text-green-800">Great form!</div>
            <div className="text-xs text-green-600">No issues detected</div>
          </div>
        )}

        {/* Session Not Started */}
        {reps === 0 && (
          <div className="p-4 bg-gray-50 rounded-2xl text-center">
            <div className="text-3xl mb-2">📹</div>
            <div className="text-sm font-medium text-gray-700">Ready to start</div>
            <div className="text-xs text-gray-500">Begin your session to see metrics</div>
          </div>
        )}
      </div>
    </div>
  );
};
