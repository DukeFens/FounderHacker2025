'use client';

import React from 'react';
import { Exercise } from '@/types';
import { Play, Square, Circle } from 'lucide-react';

interface ControlBarProps {
  exercise: Exercise;
  isActive: boolean;
  onStartSession: (exercise: Exercise) => void;
  onStopSession: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  exercise,
  isActive,
  onStartSession,
  onStopSession
}) => {
  const [isRecording, setIsRecording] = React.useState(false);

  const handleExerciseChange = (newExercise: Exercise) => {
    if (!isActive) {
      onStartSession(newExercise);
    }
  };

  const handleStartStop = () => {
    if (isActive) {
      onStopSession();
    } else {
      onStartSession(exercise);
    }
  };

  const handleRecordingToggle = () => {
    if (isActive) {
      setIsRecording(!isRecording);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Exercise Selection */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Exercise:</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleExerciseChange('Pullup')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                exercise === 'Pullup'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={isActive}
            >
              Pull-up
            </button>
            <button
              onClick={() => handleExerciseChange('Squat')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                exercise === 'Squat'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={isActive}
            >
              Squat
            </button>
            <button
              onClick={() => handleExerciseChange('ShoulderAbduction')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                exercise === 'ShoulderAbduction'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={isActive}
            >
              Shoulder Abduction
            </button>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4">
          {/* Start/Stop Button */}
          <button
            onClick={handleStartStop}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              isActive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
            }`}
          >
            {isActive ? (
              <>
                <Square className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start
              </>
            )}
          </button>

          {/* Recording Toggle */}
          <button
            onClick={handleRecordingToggle}
            disabled={!isActive}
            className={`p-3 rounded-2xl transition-all duration-200 flex items-center gap-2 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg'
                : isActive
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Circle className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
            {isRecording ? 'Recording' : 'Record'}
          </button>
        </div>


      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Status: {isActive ? 'Active' : 'Inactive'}</span>
            {isRecording && <span className="text-red-600">● Recording</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>Engine: {process.env.NEXT_PUBLIC_POSE_ENGINE || 'mediapipe'}</span>
            <span>Mode: {process.env.NEXT_PUBLIC_API_MODE || 'mock'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
