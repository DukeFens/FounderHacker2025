'use client';

import React from 'react';
import { SessionDetail } from '@/types';
import { TrendingUp, Target, BarChart3, Activity } from 'lucide-react';

interface MetricsPanelProps {
  session: SessionDetail;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ session }) => {
  const calculateAdherence = () => {
    if (session.repMetrics.length === 0) return 0;
    const goodReps = session.repMetrics.filter(rep => rep.score >= 80).length;
    return Math.round((goodReps / session.repMetrics.length) * 100);
  };

  const calculateROMTrend = () => {
    if (session.repMetrics.length < 2) return 'stable';
    
    const scores = session.repMetrics.map(rep => rep.score);
    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(Math.ceil(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const adherence = calculateAdherence();
  const romTrend = calculateROMTrend();

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
        Session Metrics
      </h3>
      
      <div className="space-y-6">
        {/* Adherence Percentage */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Adherence</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{adherence}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${adherence}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {session.repMetrics.filter(rep => rep.score >= 80).length} of {session.repMetrics.length} reps
          </div>
        </div>

        {/* Average Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Average Score</span>
          </div>
          <div className={`text-3xl font-bold mb-2 ${
            session.avgScore >= 90 ? 'text-green-600' :
            session.avgScore >= 80 ? 'text-blue-600' :
            session.avgScore >= 70 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {session.avgScore}%
          </div>
          <div className="text-xs text-gray-500">
            Based on {session.repMetrics.length} reps
          </div>
        </div>

        {/* ROM Trend */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">ROM Trend</span>
          </div>
          <div className="text-2xl mb-2">{getTrendIcon(romTrend)}</div>
          <div className={`font-medium ${getTrendColor(romTrend)}`}>
            {romTrend.charAt(0).toUpperCase() + romTrend.slice(1)}
          </div>
          <div className="text-xs text-gray-500">
            Performance over time
          </div>
        </div>

        {/* Exercise Specific Metrics */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 text-center">
            {session.exercise} Analysis
          </h4>
          
          {session.exercise === 'Squat' ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target Depth:</span>
                <span className="font-medium">
                  {session.repMetrics.filter(rep => 
                    rep.angles.knee && rep.angles.knee < 120
                  ).length} / {session.repMetrics.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chest Position:</span>
                <span className="font-medium">
                  {session.repMetrics.filter(rep => 
                    rep.angles.torso && rep.angles.torso < 15
                  ).length} / {session.repMetrics.length}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Target ROM:</span>
                <span className="font-medium">
                  {session.repMetrics.filter(rep => 
                    rep.angles.shoulder && Math.abs(rep.angles.shoulder - 90) < 10
                  ).length} / {session.repMetrics.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Symmetry:</span>
                <span className="font-medium">
                  {session.repMetrics.filter(rep => 
                    rep.flags.filter(flag => flag.includes('symmetry')).length === 0
                  ).length} / {session.repMetrics.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Flags Summary */}
        {session.flags.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 text-center">
              Common Issues
            </h4>
            <div className="space-y-2">
              {session.flags.slice(0, 3).map((flag, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">{flag}</span>
                </div>
              ))}
              {session.flags.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{session.flags.length - 3} more issues
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 text-center">
            Insights
          </h4>
          <div className="text-xs text-gray-600 space-y-2">
            {adherence >= 90 && (
              <div className="text-center text-green-600">
                🎉 Excellent form consistency!
              </div>
            )}
            {adherence >= 80 && adherence < 90 && (
              <div className="text-center text-blue-600">
                👍 Good form, minor improvements possible
              </div>
            )}
            {adherence >= 70 && adherence < 80 && (
              <div className="text-center text-yellow-600">
                ⚠️ Moderate form issues detected
              </div>
            )}
            {adherence < 70 && (
              <div className="text-center text-red-600">
                ❌ Significant form issues need attention
              </div>
            )}
            
            {romTrend === 'improving' && (
              <div className="text-center text-green-600">
                📈 Performance improving throughout session
              </div>
            )}
            {romTrend === 'declining' && (
              <div className="text-center text-red-600">
                📉 Performance declining - consider rest
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
